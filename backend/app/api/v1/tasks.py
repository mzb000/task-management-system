"""Task CRUD endpoints with search, filtering, and sorting."""
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.task import Task, TaskPriority, TaskStatus
from app.models.user import User
from app.schemas.task import TaskCreate, TaskOut, TaskUpdate
from app.services.activity import create_notification, log_activity

router = APIRouter(prefix="/tasks", tags=["Tasks"])


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
    # Notify assignee if assigned to someone else
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
    search: Optional[str] = Query(None, description="Search by title/description"),
    status_filter: Optional[TaskStatus] = Query(None, alias="status"),
    priority: Optional[TaskPriority] = None,
    sort_by: str = Query("created_at", pattern="^(created_at|due_date|priority|title)$"),
    order: str = Query("desc", pattern="^(asc|desc)$"),
    skip: int = 0,
    limit: int = 100,
):
    query = db.query(Task).options(
        joinedload(Task.owner), joinedload(Task.assignee)
    ).filter(
        or_(Task.owner_id == current_user.id, Task.assignee_id == current_user.id)
    )

    if search:
        like = f"%{search}%"
        query = query.filter(or_(Task.title.ilike(like), Task.description.ilike(like)))
    if status_filter:
        query = query.filter(Task.status == status_filter)
    if priority:
        query = query.filter(Task.priority == priority)

    sort_col = getattr(Task, sort_by)
    query = query.order_by(sort_col.asc() if order == "asc" else sort_col.desc())
    return query.offset(skip).limit(limit).all()


@router.get("/{task_id}", response_model=TaskOut)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = _get_owned_task(db, task_id, current_user)
    return task


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
