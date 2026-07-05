from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc, case
from typing import List, Optional
from app.database import get_db
from app.models import (
    User, UserRole, UserStatus, Department, Classroom,
    Event, Complaint, Announcement, Attendance, Timetable,
    NotificationType, ComplaintStatus, EventStatus, ActivityLog
)
from app.schemas import (
    UserOut, UserStatusUpdate, DashboardStats, DepartmentOut,
    DepartmentCreate, DepartmentUpdate, ClassroomOut, ClassroomCreate,
    ClassroomUpdate, AnnouncementCreate, AnnouncementOut, ActivityLogOut
)
from app.utils.auth import get_current_user, require_admin
from app.utils.helpers import log_activity, create_notification, create_bulk_notifications

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    total_students = db.query(User).filter(User.role == UserRole.student, User.status == UserStatus.approved).count()
    total_faculty = db.query(User).filter(User.role == UserRole.faculty, User.status == UserStatus.approved).count()
    total_departments = db.query(Department).count()
    total_classrooms = db.query(Classroom).count()
    total_events = db.query(Event).count()
    total_complaints = db.query(Complaint).count()
    pending_approvals = db.query(User).filter(User.status == UserStatus.pending).count()
    active_complaints = db.query(Complaint).filter(
        Complaint.status.in_([ComplaintStatus.pending, ComplaintStatus.in_progress])
    ).count()

    # Average attendance
    total_att = db.query(Attendance).count()
    present_att = db.query(Attendance).filter(Attendance.status == "present").count()
    avg_attendance = round((present_att / total_att * 100) if total_att > 0 else 0, 1)

    return DashboardStats(
        total_students=total_students,
        total_faculty=total_faculty,
        total_departments=total_departments,
        total_classrooms=total_classrooms,
        total_events=total_events,
        total_complaints=total_complaints,
        pending_approvals=pending_approvals,
        active_complaints=active_complaints,
        average_attendance=avg_attendance,
    )


@router.get("/pending-users", response_model=List[UserOut])
def get_pending_users(
    role: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    query = db.query(User).options(joinedload(User.department)).filter(User.status == UserStatus.pending)
    if role:
        query = query.filter(User.role == role)
    return query.order_by(desc(User.created_at)).all()


@router.put("/users/{user_id}/status", response_model=UserOut)
def update_user_status(
    user_id: int,
    payload: UserStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    old_status = user.status
    user.status = payload.status
    db.commit()
    db.refresh(user)

    action = "approved" if payload.status == UserStatus.approved else "rejected"
    log_activity(db, current_user.id, f"User {action}: {user.email}", "user", user_id)

    # Notify user
    create_notification(
        db, user.id,
        f"Account {action.capitalize()}",
        f"Your account has been {action} by the administrator. {'You can now login.' if action == 'approved' else ''}",
        NotificationType.registration,
    )

    return user


@router.get("/users", response_model=List[UserOut])
def get_all_users(
    role: Optional[str] = None,
    status: Optional[str] = None,
    department_id: Optional[int] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    query = db.query(User).options(joinedload(User.department))
    if role:
        query = query.filter(User.role == role)
    if status:
        query = query.filter(User.status == status)
    if department_id:
        query = query.filter(User.department_id == department_id)
    if search:
        query = query.filter(
            (User.name.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%"))
        )
    return query.offset(skip).limit(limit).all()


@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == UserRole.admin:
        raise HTTPException(status_code=400, detail="Cannot delete admin account")
    log_activity(db, current_user.id, f"Deleted user: {user.email}", "user", user_id)
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}


# ─── Analytics ───────────────────────────────
@router.get("/analytics/attendance-by-department")
def attendance_by_department(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    results = (
        db.query(
            Department.name,
            func.count(Attendance.id).label("total"),
            func.sum(
    case(
        (Attendance.status == "present", 1),
        else_=0
    )
).label("present")
        )
        .join(Timetable, Timetable.department_id == Department.id)
        .join(Attendance, Attendance.timetable_id == Timetable.id)
        .group_by(Department.name)
        .all()
    )
    return [
        {
            "department": r.name,
            "total": r.total,
            "present": r.present or 0,
            "percentage": round((r.present or 0) / r.total * 100, 1) if r.total else 0,
        }
        for r in results
    ]


@router.get("/analytics/complaints-by-category")
def complaints_by_category(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    results = (
        db.query(Complaint.category, func.count(Complaint.id).label("count"))
        .group_by(Complaint.category)
        .all()
    )
    return [{"category": r.category, "count": r.count} for r in results]


@router.get("/analytics/complaints-by-status")
def complaints_by_status(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    results = (
        db.query(Complaint.status, func.count(Complaint.id).label("count"))
        .group_by(Complaint.status)
        .all()
    )
    return [{"status": r.status, "count": r.count} for r in results]


@router.get("/analytics/events-by-status")
def events_by_status(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    results = (
        db.query(Event.status, func.count(Event.id).label("count"))
        .group_by(Event.status)
        .all()
    )
    return [{"status": r.status, "count": r.count} for r in results]


@router.get("/analytics/users-by-department")
def users_by_department(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    results = (
        db.query(Department.name, func.count(User.id).label("count"))
        .join(User, User.department_id == Department.id)
        .filter(User.role == UserRole.student, User.status == UserStatus.approved)
        .group_by(Department.name)
        .all()
    )
    return [{"department": r.name, "count": r.count} for r in results]


@router.get("/analytics/monthly-registrations")
def monthly_registrations(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    results = (
        db.query(
            func.to_char(User.created_at, "YYYY-MM").label("month"),
            func.count(User.id).label("count")
        )
        .filter(User.role != UserRole.admin)
        .group_by(func.to_char(User.created_at, "YYYY-MM"))
        .order_by("month")
        .limit(12)
        .all()
    )
    return [{"month": r.month, "count": r.count} for r in results]


@router.get("/activity-logs", response_model=List[ActivityLogOut])
def get_activity_logs(
    skip: int = 0,
    limit: int = 50,
    user_id: Optional[int] = None,
    entity_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    query = db.query(ActivityLog).options(joinedload(ActivityLog.user))
    if user_id:
        query = query.filter(ActivityLog.user_id == user_id)
    if entity_type:
        query = query.filter(ActivityLog.entity_type == entity_type)
    return query.order_by(desc(ActivityLog.created_at)).offset(skip).limit(limit).all()
