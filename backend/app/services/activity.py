"""Helpers for recording activity logs and creating in-app notifications."""
from sqlalchemy.orm import Session

from app.models.collaboration import ActivityLog, Notification


def log_activity(
    db: Session,
    user_id: int,
    action: str,
    entity: str | None = None,
    entity_id: int | None = None,
    detail: str | None = None,
) -> ActivityLog:
    activity = ActivityLog(
        user_id=user_id,
        action=action,
        entity=entity,
        entity_id=entity_id,
        detail=detail,
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str | None = None,
    link: str | None = None,
) -> Notification:
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        link=link,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification
