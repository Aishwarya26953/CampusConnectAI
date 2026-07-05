from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from typing import List, Optional
from app.database import get_db
from app.models import Timetable, Classroom, User, UserRole, UserStatus, DayOfWeek
from app.schemas import TimetableCreate, TimetableUpdate, TimetableOut
from app.utils.auth import get_current_user, require_admin, require_faculty
from app.utils.helpers import log_activity

router = APIRouter(prefix="/timetables", tags=["Timetables"])


def check_conflict(db: Session, classroom_id: int, day: DayOfWeek,
                   start_time, end_time, exclude_id: Optional[int] = None):
    query = db.query(Timetable).filter(
        Timetable.classroom_id == classroom_id,
        Timetable.day == day,
        Timetable.start_time < end_time,
        Timetable.end_time > start_time,
    )
    if exclude_id:
        query = query.filter(Timetable.id != exclude_id)
    return query.first()


@router.get("/", response_model=List[TimetableOut])
def list_timetables(
    department_id: Optional[int] = None,
    faculty_id: Optional[int] = None,
    semester: Optional[int] = None,
    day: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Timetable).options(
        joinedload(Timetable.faculty),
        joinedload(Timetable.classroom),
        joinedload(Timetable.department),
    )
    if department_id:
        query = query.filter(Timetable.department_id == department_id)
    if faculty_id:
        query = query.filter(Timetable.faculty_id == faculty_id)
    if semester:
        query = query.filter(Timetable.semester == semester)
    if day:
        query = query.filter(Timetable.day == day)
    return query.all()


@router.post("/", response_model=TimetableOut, status_code=201)
def create_timetable(
    payload: TimetableCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    conflict = check_conflict(db, payload.classroom_id, payload.day, payload.start_time, payload.end_time)
    if conflict:
        raise HTTPException(
            status_code=409,
            detail=f"Timetable conflict: Room already booked for {conflict.subject} on {payload.day} at that time"
        )

    tt = Timetable(**payload.dict())
    db.add(tt)
    db.commit()
    db.refresh(tt)
    log_activity(db, current_user.id, f"Created timetable: {tt.subject}", "timetable", tt.id)

    result = db.query(Timetable).options(
        joinedload(Timetable.faculty),
        joinedload(Timetable.classroom),
        joinedload(Timetable.department),
    ).filter(Timetable.id == tt.id).first()
    return result


@router.put("/{tt_id}", response_model=TimetableOut)
def update_timetable(
    tt_id: int,
    payload: TimetableUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    tt = db.query(Timetable).filter(Timetable.id == tt_id).first()
    if not tt:
        raise HTTPException(status_code=404, detail="Timetable not found")

    new_classroom_id = payload.classroom_id or tt.classroom_id
    new_day = payload.day or tt.day
    new_start = payload.start_time or tt.start_time
    new_end = payload.end_time or tt.end_time

    conflict = check_conflict(db, new_classroom_id, new_day, new_start, new_end, exclude_id=tt_id)
    if conflict:
        raise HTTPException(status_code=409, detail=f"Timetable conflict with: {conflict.subject}")

    for field, value in payload.dict(exclude_none=True).items():
        setattr(tt, field, value)
    db.commit()
    db.refresh(tt)

    result = db.query(Timetable).options(
        joinedload(Timetable.faculty),
        joinedload(Timetable.classroom),
        joinedload(Timetable.department),
    ).filter(Timetable.id == tt_id).first()
    return result


@router.delete("/{tt_id}")
def delete_timetable(tt_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    tt = db.query(Timetable).filter(Timetable.id == tt_id).first()
    if not tt:
        raise HTTPException(status_code=404, detail="Timetable not found")
    log_activity(db, current_user.id, f"Deleted timetable: {tt.subject}", "timetable", tt_id)
    db.delete(tt)
    db.commit()
    return {"message": "Timetable deleted"}
