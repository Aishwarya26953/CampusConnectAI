from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from datetime import time
from app.database import get_db
from app.models import Classroom, Timetable, DayOfWeek, User
from app.schemas import (
    ClassroomCreate, ClassroomUpdate, ClassroomOut,
    ClassroomRecommendRequest
)
from app.utils.auth import get_current_user, require_admin
from app.utils.helpers import log_activity

router = APIRouter(prefix="/classrooms", tags=["Classrooms"])


def _has_conflict(db: Session, classroom_id: int, day: DayOfWeek, start: time, end: time, exclude_id: Optional[int] = None):
    query = db.query(Timetable).filter(
        Timetable.classroom_id == classroom_id,
        Timetable.day == day,
        Timetable.start_time < end,
        Timetable.end_time > start,
    )
    if exclude_id:
        query = query.filter(Timetable.id != exclude_id)
    return query.first() is not None


@router.get("/", response_model=List[ClassroomOut])
def list_classrooms(
    building: Optional[str] = None,
    min_capacity: Optional[int] = None,
    is_available: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Classroom)
    if building:
        query = query.filter(Classroom.building.ilike(f"%{building}%"))
    if min_capacity:
        query = query.filter(Classroom.capacity >= min_capacity)
    if is_available is not None:
        query = query.filter(Classroom.is_available == is_available)
    return query.all()


@router.post("/", response_model=ClassroomOut, status_code=201)
def create_classroom(
    payload: ClassroomCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    existing = db.query(Classroom).filter(Classroom.room_number == payload.room_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Room number already exists")
    room = Classroom(**payload.dict())
    db.add(room)
    db.commit()
    db.refresh(room)
    log_activity(db, current_user.id, f"Created classroom: {room.room_number}", "classroom", room.id)
    return room


@router.get("/recommend", response_model=List[ClassroomOut])
def recommend_classrooms(
    required_capacity: int,
    day: DayOfWeek,
    start_time: str,
    end_time: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from datetime import time as dtime
    def parse_time(t: str) -> dtime:
        parts = t.split(":")
        return dtime(int(parts[0]), int(parts[1]))

    start = parse_time(start_time)
    end = parse_time(end_time)

    all_rooms = db.query(Classroom).filter(
        Classroom.capacity >= required_capacity,
        Classroom.is_available == True
    ).order_by(Classroom.capacity).all()

    available = [r for r in all_rooms if not _has_conflict(db, r.id, day, start, end)]
    return available[:5]


@router.get("/{room_id}", response_model=ClassroomOut)
def get_classroom(room_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    room = db.query(Classroom).filter(Classroom.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Classroom not found")
    return room


@router.put("/{room_id}", response_model=ClassroomOut)
def update_classroom(
    room_id: int,
    payload: ClassroomUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    room = db.query(Classroom).filter(Classroom.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Classroom not found")
    for field, value in payload.dict(exclude_none=True).items():
        setattr(room, field, value)
    db.commit()
    db.refresh(room)
    log_activity(db, current_user.id, f"Updated classroom: {room.room_number}", "classroom", room_id)
    return room


@router.delete("/{room_id}")
def delete_classroom(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    room = db.query(Classroom).filter(Classroom.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Classroom not found")
    log_activity(db, current_user.id, f"Deleted classroom: {room.room_number}", "classroom", room_id)
    db.delete(room)
    db.commit()
    return {"message": "Classroom deleted"}
