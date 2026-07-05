from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime, timezone
from app.database import get_db
from app.models import (
    Event, EventRegistration, User, UserRole, UserStatus,
    EventStatus, NotificationType
)
from app.schemas import EventCreate, EventUpdate, EventOut
from app.utils.auth import get_current_user, require_admin, require_faculty
from app.utils.helpers import log_activity, create_notification, create_bulk_notifications

router = APIRouter(prefix="/events", tags=["Events"])


def _enrich_event(event: Event, db: Session, user_id: Optional[int] = None) -> dict:
    reg_count = len(event.registrations)
    is_registered = False
    if user_id:
        is_registered = any(r.student_id == user_id for r in event.registrations)
    return {
        **event.__dict__,
        "registration_count": reg_count,
        "is_registered": is_registered,
        "faculty": event.faculty,
    }


@router.get("/", response_model=List[EventOut])
def list_events(
    status: Optional[str] = None,
    upcoming: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Event).options(
        joinedload(Event.faculty),
        joinedload(Event.registrations)
    )

    if status:
        query = query.filter(Event.status == status)

    if upcoming:
        query = query.filter(Event.event_date >= datetime.now(timezone.utc))

    events = query.order_by(desc(Event.created_at)).all()

    result = []
    for e in events:
        d = _enrich_event(e, db, current_user.id)
        d.pop("_sa_instance_state", None)
        result.append(EventOut(**d))

    return result


@router.post("/", response_model=EventOut, status_code=201)
def create_event(
    payload: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty)
):
    event = Event(
        **payload.dict(),
        faculty_id=current_user.id,
        status=EventStatus.pending
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    log_activity(db, current_user.id, f"Created event: {event.title}", "event", event.id)

    # Notify admin
    admin = db.query(User).filter(User.role == UserRole.admin).first()
    if admin:
        create_notification(
            db, admin.id,
            "New Event Pending Approval",
            f'{current_user.name} created event "{event.title}" awaiting approval.',
            NotificationType.event, event.id
        )

    result = db.query(Event).options(
        joinedload(Event.faculty), joinedload(Event.registrations)
    ).filter(Event.id == event.id).first()
    d = _enrich_event(result, db, current_user.id)
    d.pop("_sa_instance_state", None)
    return EventOut(**d)


@router.put("/{event_id}/status")
def update_event_status(
    event_id: int,
    status: EventStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    event.status = status
    db.commit()

    action = "approved" if status == EventStatus.approved else status.value
    log_activity(db, current_user.id, f"Event {action}: {event.title}", "event", event_id)

    # Notify creator
    create_notification(
        db, event.faculty_id,
        f"Event {action.capitalize()}",
        f'Your event "{event.title}" has been {action}.',
        NotificationType.event, event_id
    )

    # If approved, notify all students
    if status == EventStatus.approved:
        students = db.query(User).filter(
            User.role == UserRole.student, User.status == UserStatus.approved
        ).all()
        student_ids = [s.id for s in students]
        create_bulk_notifications(
            db, student_ids,
            f"New Event: {event.title}",
            f"A new event '{event.title}' is now open for registration!",
            NotificationType.event, event_id
        )

    return {"message": f"Event {action} successfully"}


@router.post("/{event_id}/register")
def register_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event = db.query(Event).options(
        joinedload(Event.registrations)
    ).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if event.status != EventStatus.approved:
        raise HTTPException(status_code=400, detail="Event is not open for registration")

    event_date = event.event_date

    if event_date.tzinfo is not None:
        now = datetime.now(timezone.utc)
    else:
        now = datetime.now()

    if event_date < now:
        raise HTTPException(
            status_code=400,
            detail="Event has already passed"
        )

    existing = db.query(EventRegistration).filter(
        EventRegistration.event_id == event_id,
        EventRegistration.student_id == current_user.id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Already registered for this event"
        )

    if event.max_participants and len(event.registrations) >= event.max_participants:
        raise HTTPException(
            status_code=400,
            detail="Event is full"
        )

    reg = EventRegistration(
        event_id=event_id,
        student_id=current_user.id
    )

    db.add(reg)
    db.commit()

    log_activity(
        db,
        current_user.id,
        f"Registered for event: {event.title}",
        "event",
        event_id
    )

    return {"message": "Successfully registered for event"}


@router.delete("/{event_id}/unregister")
def unregister_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reg = db.query(EventRegistration).filter(
        EventRegistration.event_id == event_id,
        EventRegistration.student_id == current_user.id
    ).first()
    if not reg:
        raise HTTPException(status_code=404, detail="Not registered for this event")
    db.delete(reg)
    db.commit()
    return {"message": "Unregistered from event"}


@router.put("/{event_id}", response_model=EventOut)
def update_event(
    event_id: int,
    payload: EventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_faculty)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if current_user.role.value == "faculty" and event.faculty_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    for field, value in payload.dict(exclude_none=True).items():
        setattr(event, field, value)
    db.commit()
    db.refresh(event)
    result = db.query(Event).options(
        joinedload(Event.faculty), joinedload(Event.registrations)
    ).filter(Event.id == event_id).first()
    d = _enrich_event(result, db, current_user.id)
    d.pop("_sa_instance_state", None)
    return EventOut(**d)


@router.get("/{event_id}", response_model=EventOut)
def get_event(event_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    event = db.query(Event).options(
        joinedload(Event.faculty), joinedload(Event.registrations)
    ).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    d = _enrich_event(event, db, current_user.id)
    d.pop("_sa_instance_state", None)
    return EventOut(**d)


@router.delete("/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    log_activity(db, current_user.id, f"Deleted event: {event.title}", "event", event_id)
    db.delete(event)
    db.commit()
    return {"message": "Event deleted"}
