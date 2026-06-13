"""Task CRUD endpoints with search, filtering, sorting, and bulk operations."""
from datetime import datetime
from typing import List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.task import Task, TaskPriority, TaskStatus
from app.models.user import User
from app.schemas.task import TaskCreate, TaskOut, TaskUpdate
from app.services.activity import create_notification, log_activity

router = APIRouter(prefix="/tasks", tags=["Tasks"])


# ---------- Schemas ----------

class TaskStats(BaseModel):
    total: int
    todo: int
    in_progress: int
    completed: int
    overdue: int
    high_priority: int
    completion_rate: float


class BulkUpdateRequest(BaseModel):
    ids: List[int]
    action: Literal["complete", "delete", "set_status", "set_priority"]
    value: Optional[str] = None  # used for set_status / set_priority


class BulkResult(BaseModel):
    affected: int
    action: str


# ---------- Endpoints ----------

@router.get("/stats", response_model=TaskStats)
def get_task_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Quick stats summary for the current user's tasks."""
    tasks = db.query(Task).filter(
        or_(Task.owner_id == current_user.id, Task.assignee_id == current_user.id)
    ).all()

    now = datetime.utcnow()
    total = len(tasks)
    completed = sum(1 for t in tasks if t.status == TaskStatus.completed)
    in_progress = sum(1 for t in tasks if t.status == TaskStatus.in_progress)
    todo = sum(1 for t in tasks if t.status == TaskStatus.todo)
    overdue = sum(
        1 for t in tasks
        if t.due_date and t.due_date < now and t.status != TaskStatus.completed
    )
    high_priority = sum(1 for t in tasks if t.priority == TaskPriority.high)
    rate = round((completed / total * 100), 1) if total else 0.0

    return TaskStats(
        total=total,
        todo=todo,
        in_progress=in_progress,
        completed=completed,
        overdue=overdue,
        high_priority=high_priority,
        completion_rate=rate,
    )


@router.post("/bulk", response_model=BulkResult)
def bulk_action(
    payload: BulkUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Perform a bulk action (complete, delete, set_status, set_priority) on multiple tasks."""
    if not payload.ids:
        raise HTTPException(status_code=400, detail="No task IDs provided")
    if len(payload.ids) > 200:
        raise HTTPException(status_code=400, detail="Maximum 200 tasks per bulk operation")

    tasks = db.query(Task).filter(
        Task.id.in_(payload.ids),
        or_(Task.owner_id == current_user.id, Task.assignee_id == current_user.id),
    ).all()

    if not tasks:
        raise HTTPException(status_code=404, detail="No accessible tasks found")

    affected = 0
    if payload.action == "delete":
        for t in tasks:
            db.delete(t)
            affected += 1
        db.commit()
        log_activity(db, current_user.id, "bulk_deleted_tasks", "task", None, f"{affected} tasks")
    elif payload.action == "complete":
        for t in tasks:
            t.status = TaskStatus.completed
            affected += 1
        db.commit()
    elif payload.action == "set_status":
        try:
            new_status = TaskStatus(payload.value)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid status: {payload.value}")
        for t in tasks:
            t.status = new_status
            affected += 1
        db.commit()
    elif payload.action == "set_priority":
        try:
            new_priority = TaskPriority(payload.value)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid priority: {payload.value}")
        for t in tasks:
            t.priority = new_priority
            affected += 1
        db.commit()

    return BulkResult(affected=affected, action=payload.action)


@router.post("", response_model=TaskOut, status_code=201)
def create_task(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = Task(**payload.model_dump(), owner_id=current_user.id)
    db.add(task)
    db.commit()
    db.refresh(task)
    log_activity(db, current_user.id, "created_task", "task", task.id, task.title)
    if task.assignee_id and task.assignee_id != current_user.id:
        create_notification(
            db, task.assignee_id,
            "New task assigned",
            f"{current_user.full_name} assigned you '{task.title}'",
            link=f"/tasks/{task.id}",
        )
    return task


@router.get("", response_model=List[TaskOut])
def list_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    search: Optional[str] = Query(None, description="Search title, description, or tags"),
    status_filter: Optional[TaskStatus] = Query(None, alias="status"),
    priority: Optional[TaskPriority] = None,
    tags: Optional[str] = Query(None, description="Comma-separated tag filter (any match)"),
    due_before: Optional[datetime] = Query(None, description="Filter tasks due before this date"),
    due_after: Optional[datetime] = Query(None, description="Filter tasks due after this date"),
    sort_by: str = Query("created_at", pattern="^(created_at|due_date|priority|title|updated_at)$"),
    order: str = Query("desc", pattern="^(asc|desc)$"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    query = db.query(Task).options(
        joinedload(Task.owner), joinedload(Task.assignee)
    ).filter(
        or_(Task.owner_id == current_user.id, Task.assignee_id == current_user.id)
    )

    if search:
        like = f"%{search}%"
        query = query.filter(
            or_(Task.title.ilike(like), Task.description.ilike(like), Task.tags.ilike(like))
        )
    if status_filter:
        query = query.filter(Task.status == status_filter)
    if priority:
        query = query.filter(Task.priority == priority)
    if tags:
        for tag in tags.split(","):
            tag = tag.strip()
            if tag:
                query = query.filter(Task.tags.ilike(f"%{tag}%"))
    if due_before:
        query = query.filter(Task.due_date <= due_before)
    if due_after:
        query = query.filter(Task.due_date >= due_after)

    sort_col = getattr(Task, sort_by)
    query = query.order_by(sort_col.asc() if order == "asc" else sort_col.desc())
    return query.offset(skip).limit(limit).all()


@router.get("/{task_id}", response_model=TaskOut)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _get_owned_task(db, task_id, current_user)


@router.put("/{task_id}", response_model=TaskOut)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = _get_owned_task(db, task_id, current_user)
    updates = payload.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    log_activity(db, current_user.id, "updated_task", "task", task.id, task.title)
    return task


@router.delete("/{task_id}", status_code=204)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = _get_owned_task(db, task_id, current_user)
    title = task.title
    db.delete(task)
    db.commit()
    log_activity(db, current_user.id, "deleted_task", "task", task_id, title)
    return None


def _get_owned_task(db: Session, task_id: int, user: User) -> Task:
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.owner_id != user.id and task.assignee_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized for this task")
    return task
