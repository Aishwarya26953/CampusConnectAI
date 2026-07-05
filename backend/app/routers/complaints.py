from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from typing import List, Optional
from app.database import get_db
from app.models import Complaint, User, UserRole, UserStatus, NotificationType, ComplaintStatus
from app.schemas import ComplaintCreate, ComplaintUpdate, ComplaintOut
from app.utils.auth import get_current_user, require_admin, require_faculty
from app.utils.helpers import log_activity, create_notification
from app.utils.ai import predict_complaint_priority

router = APIRouter(prefix="/complaints", tags=["Complaints"])


@router.get("/", response_model=List[ComplaintOut])
def list_complaints(
    status: Optional[str] = None,
    category: Optional[str] = None,
    priority: Optional[str] = None,
    student_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Complaint).options(
        joinedload(Complaint.student),
        joinedload(Complaint.assigned_to_user)
    )
    # Students see only their own
    if current_user.role.value == "student":
        query = query.filter(Complaint.student_id == current_user.id)
    elif student_id:
        query = query.filter(Complaint.student_id == student_id)

    if status:
        query = query.filter(Complaint.status == status)
    if category:
        query = query.filter(Complaint.category == category)
    if priority:
        query = query.filter(Complaint.ai_priority == priority)

    return query.order_by(desc(Complaint.created_at)).offset(skip).limit(limit).all()


@router.post("/", response_model=ComplaintOut, status_code=201)
def create_complaint(
    payload: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # AI priority prediction
    ai_result = predict_complaint_priority(
        payload.title, payload.description, payload.category.value
    )

    complaint = Complaint(
        student_id=current_user.id,
        category=payload.category,
        title=payload.title,
        description=payload.description,
        location=payload.location,
        ai_priority=ai_result.get("priority", "medium"),
        ai_priority_reason=ai_result.get("reason", ""),
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    log_activity(db, current_user.id, f"Raised complaint: {payload.title}", "complaint", complaint.id)

    # Notify admin
    admin = db.query(User).filter(User.role == UserRole.admin).first()
    if admin:
        priority_emoji = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(ai_result.get("priority"), "⚪")
        create_notification(
            db, admin.id,
            f"{priority_emoji} New {ai_result.get('priority', 'medium').upper()} Priority Complaint",
            f'{current_user.name} raised: "{payload.title}" (Category: {payload.category.value})',
            NotificationType.complaint, complaint.id
        )

    result = db.query(Complaint).options(
        joinedload(Complaint.student), joinedload(Complaint.assigned_to_user)
    ).filter(Complaint.id == complaint.id).first()
    return result


@router.get("/my-complaints", response_model=List[ComplaintOut])
def my_complaints(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Complaint).options(
        joinedload(Complaint.student),
        joinedload(Complaint.assigned_to_user)
    ).filter(Complaint.student_id == current_user.id).order_by(desc(Complaint.created_at)).all()


@router.put("/{complaint_id}", response_model=ComplaintOut)
def update_complaint(
    complaint_id: int,
    payload: ComplaintUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty)
):
    complaint = db.query(Complaint).options(
        joinedload(Complaint.student), joinedload(Complaint.assigned_to_user)
    ).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    old_status = complaint.status
    for field, value in payload.dict(exclude_none=True).items():
        setattr(complaint, field, value)
    db.commit()
    db.refresh(complaint)

    log_activity(
        db, current_user.id,
        f"Updated complaint #{complaint_id} to {payload.status}",
        "complaint", complaint_id
    )

    # Notify student of status change
    if payload.status and payload.status != old_status:
        status_msg = {
            ComplaintStatus.in_progress: "is now being addressed",
            ComplaintStatus.resolved: "has been resolved",
        }.get(payload.status, f"updated to {payload.status.value}")

        create_notification(
            db, complaint.student_id,
            "Complaint Status Updated",
            f'Your complaint "{complaint.title}" {status_msg}.',
            NotificationType.complaint, complaint_id
        )

    return db.query(Complaint).options(
        joinedload(Complaint.student), joinedload(Complaint.assigned_to_user)
    ).filter(Complaint.id == complaint_id).first()


@router.get("/{complaint_id}", response_model=ComplaintOut)
def get_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    complaint = db.query(Complaint).options(
        joinedload(Complaint.student), joinedload(Complaint.assigned_to_user)
    ).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    if current_user.role.value == "student" and complaint.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return complaint


@router.delete("/{complaint_id}")
def delete_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    db.delete(complaint)
    db.commit()
    return {"message": "Complaint deleted"}
