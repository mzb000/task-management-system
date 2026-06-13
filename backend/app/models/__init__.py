"""Import all models so they register with SQLAlchemy's metadata."""
from app.models.user import User, UserRole
from app.models.task import Task, TaskPriority, TaskStatus
from app.models.collaboration import (ActivityLog, Attachment, Comment,
                                      Notification, Workspace, WorkspaceMember)

__all__ = [
    "User", "UserRole",
    "Task", "TaskPriority", "TaskStatus",
    "Workspace", "WorkspaceMember", "Comment",
    "Notification", "ActivityLog", "Attachment",
]
