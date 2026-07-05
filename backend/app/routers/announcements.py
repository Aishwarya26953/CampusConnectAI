from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from typing import List, Optional
from app.database import get_db
from app.models import Announcement, User, UserRole, UserStatus, NotificationType
from app.schemas import AnnouncementCreate, AnnouncementUpdate, AnnouncementOut
from app.utils.auth import get_current_user, require_admin
from app.utils.helpers import log_activity, create_bulk_notifications

router = APIRouter(prefix="/announcements", tags=["Announcements"])


@router.get("/", response_model=List[AnnouncementOut])
def list_announcements(
    target_role: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Announcement).options(joinedload(Announcement.admin))
    # Filter by role relevance
    if current_user.role.value in ["student", "faculty"]:
        query = query.filter(
            (Announcement.target_role == "all") |
            (Announcement.target_role == current_user.role.value)
        )
    elif target_role:
        query = query.filter(Announcement.target_role == target_role)

    return query.order_by(desc(Announcement.is_pinned), desc(Announcement.created_at)).offset(skip).limit(limit).all()


@router.post("/", response_model=AnnouncementOut, status_code=201)
def create_announcement(
    payload: AnnouncementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    ann = Announcement(
        admin_id=current_user.id,
        **payload.dict()
    )
    db.add(ann)
    db.commit()
    db.refresh(ann)

    log_activity(db, current_user.id, f"Posted announcement: {ann.title}", "announcement", ann.id)

    # Send notifications to target users
    target = payload.target_role or "all"
    query = db.query(User).filter(User.status == UserStatus.approved, User.role != UserRole.admin)
    if target == "student":
        query = query.filter(User.role == UserRole.student)
    elif target == "faculty":
        query = query.filter(User.role == UserRole.faculty)

    user_ids = [u.id for u in query.all()]
    create_bulk_notifications(
        db, user_ids,
        f"📢 {ann.title}",
        ann.content[:200],
        NotificationType.announcement,
        ann.id
    )

    return db.query(Announcement).options(joinedload(Announcement.admin)).filter(Announcement.id == ann.id).first()


@router.put("/{ann_id}", response_model=AnnouncementOut)
def update_announcement(
    ann_id: int,
    payload: AnnouncementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    ann = db.query(Announcement).filter(Announcement.id == ann_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    for field, value in payload.dict(exclude_none=True).items():
        setattr(ann, field, value)
    db.commit()
    db.refresh(ann)
    return db.query(Announcement).options(joinedload(Announcement.admin)).filter(Announcement.id == ann_id).first()


@router.delete("/{ann_id}")
def delete_announcement(ann_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    ann = db.query(Announcement).filter(Announcement.id == ann_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    db.delete(ann)
    db.commit()
    return {"message": "Announcement deleted"}
