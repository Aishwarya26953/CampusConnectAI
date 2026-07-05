from sqlalchemy.orm import Session
from app.models import ActivityLog, Notification, NotificationType
from typing import Optional, Any


def log_activity(
    db: Session,
    user_id: Optional[int],
    action: str,
    entity_type: Optional[str] = None,
    entity_id: Optional[int] = None,
    details: Optional[Any] = None,
    ip_address: Optional[str] = None,
):
    log = ActivityLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details,
        ip_address=ip_address,
    )
    db.add(log)
    db.commit()


def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notif_type: NotificationType = NotificationType.general,
    related_id: Optional[int] = None,
):
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=notif_type,
        related_id=related_id,
    )
    db.add(notif)
    db.commit()
    return notif


def create_bulk_notifications(
    db: Session,
    user_ids: list,
    title: str,
    message: str,
    notif_type: NotificationType = NotificationType.general,
    related_id: Optional[int] = None,
):
    notifs = [
        Notification(
            user_id=uid,
            title=title,
            message=message,
            type=notif_type,
            related_id=related_id,
        )
        for uid in user_ids
    ]
    db.bulk_save_objects(notifs)
    db.commit()
