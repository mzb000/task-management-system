"""Pydantic schemas for tasks and related entities."""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.task import TaskPriority, TaskStatus
from app.schemas.user import UserOut


# ---------- Task ----------
class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: TaskPriority = TaskPriority.medium
    status: TaskStatus = TaskStatus.todo
    tags: Optional[str] = None
    assignee_id: Optional[int] = None
    workspace_id: Optional[int] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None
    tags: Optional[str] = None
    assignee_id: Optional[int] = None


class TaskOut(TaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime
    owner: Optional[UserOut] = None
    assignee: Optional[UserOut] = None


# ---------- Comment ----------
class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1)


class CommentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    content: str
    task_id: int
    author_id: int
    mentions: Optional[str] = None
    created_at: datetime
    author: Optional[UserOut] = None


# ---------- Attachment ----------
class AttachmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    task_id: int
    filename: str
    file_url: str
    content_type: Optional[str] = None
    size: Optional[int] = None
    uploaded_at: datetime


# ---------- Notification ----------
class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    message: Optional[str] = None
    is_read: bool
    link: Optional[str] = None
    created_at: datetime


# ---------- Activity ----------
class ActivityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    action: str
    entity: Optional[str] = None
    entity_id: Optional[int] = None
    detail: Optional[str] = None
    created_at: datetime
    user: Optional[UserOut] = None


# ---------- Workspace ----------
class WorkspaceCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    description: Optional[str] = None


class WorkspaceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: Optional[str] = None
    owner_id: int
    created_at: datetime


class InviteMemberRequest(BaseModel):
    email: str


# ---------- Dashboard ----------
class DashboardStats(BaseModel):
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    overdue_tasks: int
    completion_percentage: float
    by_status: dict
    by_priority: dict
    recent_activities: List[ActivityOut] = []
