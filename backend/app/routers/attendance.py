from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, func
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.models import (
    Attendance, Timetable, User, UserRole, UserStatus,
    AttendanceStatus, NotificationType
)
from app.schemas import (
    AttendanceMark, AttendanceOut, AttendanceSummary, AttendanceUpdate
)
from app.utils.auth import get_current_user, require_faculty
from app.utils.helpers import log_activity, create_notification

router = APIRouter(prefix="/attendance", tags=["Attendance"])


@router.post("/mark", response_model=dict)
def mark_attendance(
    payload: AttendanceMark,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty)
):
    tt = db.query(Timetable).filter(Timetable.id == payload.timetable_id).first()
    if not tt:
        raise HTTPException(status_code=404, detail="Timetable not found")

    # Only the assigned faculty or admin can mark
    if current_user.role.value == "faculty" and tt.faculty_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only mark attendance for your own classes")

    created = 0
    updated = 0
    warned_students = []

    for record in payload.records:
        existing = db.query(Attendance).filter(
            Attendance.timetable_id == payload.timetable_id,
            Attendance.student_id == record.student_id,
            Attendance.date == payload.date,
        ).first()

        if existing:
            existing.status = record.status
            existing.marked_by = current_user.id
            updated += 1
        else:
            att = Attendance(
                timetable_id=payload.timetable_id,
                student_id=record.student_id,
                date=payload.date,
                status=record.status,
                marked_by=current_user.id,
            )
            db.add(att)
            created += 1

    db.commit()

    # Check attendance warnings for all students marked today
    for record in payload.records:
        summary = _calculate_summary(db, record.student_id, payload.timetable_id)
        if summary["percentage"] < 75:
            classes_needed = _classes_to_75(summary["present"], summary["total"])
            student = db.query(User).filter(User.id == record.student_id).first()
            if student:
                create_notification(
                    db, record.student_id,
                    "⚠️ Low Attendance Warning",
                    f"Your attendance is {summary['percentage']:.1f}%. You need {classes_needed} more classes to reach 75%.",
                    NotificationType.attendance,
                    payload.timetable_id,
                )
                warned_students.append(record.student_id)

    log_activity(
        db, current_user.id,
        f"Marked attendance for {len(payload.records)} students",
        "attendance", payload.timetable_id,
        {"date": str(payload.date), "records": created + updated}
    )

    return {
        "message": f"Attendance marked: {created} new, {updated} updated",
        "attendance_warnings_sent": len(warned_students)
    }


def _calculate_summary(db: Session, student_id: int, timetable_id: Optional[int] = None):
    query = db.query(Attendance).filter(Attendance.student_id == student_id)
    if timetable_id:
        query = query.filter(Attendance.timetable_id == timetable_id)
    records = query.all()
    total = len(records)
    present = sum(1 for r in records if r.status == AttendanceStatus.present)
    absent = sum(1 for r in records if r.status == AttendanceStatus.absent)
    late = sum(1 for r in records if r.status == AttendanceStatus.late)
    percentage = round((present / total * 100) if total > 0 else 0, 1)
    return {"total": total, "present": present, "absent": absent, "late": late, "percentage": percentage}


def _classes_to_75(present: int, total: int) -> int:
    """Calculate how many more classes needed to reach 75%."""
    if total == 0:
        return 0
    if present / total >= 0.75:
        return 0
    # present + x / (total + x) = 0.75 => x = (0.75*total - present) / 0.25
    needed = max(0, int((0.75 * total - present) / 0.25) + 1)
    return needed


@router.get("/summary/{student_id}", response_model=AttendanceSummary)
def get_attendance_summary(
    student_id: int,
    timetable_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Students can only see their own
    if current_user.role.value == "student" and current_user.id != student_id:
        raise HTTPException(status_code=403, detail="Access denied")

    summary = _calculate_summary(db, student_id, timetable_id)
    classes_needed = _classes_to_75(summary["present"], summary["total"])

    return AttendanceSummary(
        student_id=student_id,
        total_classes=summary["total"],
        present=summary["present"],
        absent=summary["absent"],
        late=summary["late"],
        percentage=summary["percentage"],
        classes_needed_for_75=classes_needed,
    )


@router.get("/my-attendance", response_model=List[AttendanceOut])
def my_attendance(
    timetable_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Attendance).options(
        joinedload(Attendance.timetable).joinedload(Timetable.classroom),
        joinedload(Attendance.timetable).joinedload(Timetable.department),
    ).filter(Attendance.student_id == current_user.id)
    if timetable_id:
        query = query.filter(Attendance.timetable_id == timetable_id)
    return query.order_by(Attendance.date.desc()).all()


@router.get("/by-timetable/{timetable_id}", response_model=List[AttendanceOut])
def get_by_timetable(
    timetable_id: int,
    attendance_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty)
):
    query = db.query(Attendance).options(
        joinedload(Attendance.student)
    ).filter(Attendance.timetable_id == timetable_id)
    if attendance_date:
        query = query.filter(Attendance.date == attendance_date)
    return query.all()


@router.put("/{attendance_id}", response_model=AttendanceOut)
def update_attendance(
    attendance_id: int,
    payload: AttendanceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty)
):
    att = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not att:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    att.status = payload.status
    att.marked_by = current_user.id
    db.commit()
    db.refresh(att)
    log_activity(db, current_user.id, "Edited attendance record", "attendance", attendance_id)
    return att


@router.get("/all-summaries")
def all_student_summaries(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty)
):
    from app.models import UserRole, UserStatus
    students = db.query(User).filter(
        User.role == UserRole.student,
        User.status == UserStatus.approved
    ).all()

    results = []
    for student in students:
        summary = _calculate_summary(db, student.id)
        classes_needed = _classes_to_75(summary["present"], summary["total"])
        results.append({
            "student_id": student.id,
            "student_name": student.name,
            "email": student.email,
            **summary,
            "classes_needed_for_75": classes_needed,
            "warning": summary["percentage"] < 75,
        })
    return results
