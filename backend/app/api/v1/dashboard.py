"""Dashboard analytics endpoint."""
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.collaboration import ActivityLog
from app.models.task import Task, TaskPriority, TaskStatus
from app.models.user import User
from app.schemas.task import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    base = db.query(Task).filter(
        or_(Task.owner_id == current_user.id, Task.assignee_id == current_user.id)
    )
    tasks = base.all()

    total = len(tasks)
    completed = sum(1 for t in tasks if t.status == TaskStatus.completed)
    pending = total - completed
    now = datetime.utcnow()
    overdue = sum(
        1 for t in tasks
        if t.due_date and t.due_date < now and t.status != TaskStatus.completed
    )
    completion_pct = round((completed / total) * 100, 1) if total else 0.0

    by_status = {s.value: 0 for s in TaskStatus}
    by_priority = {p.value: 0 for p in TaskPriority}
    for t in tasks:
        by_status[t.status.value] += 1
        by_priority[t.priority.value] += 1

    recent = (
        db.query(ActivityLog)
        .options(joinedload(ActivityLog.user))
        .filter(ActivityLog.user_id == current_user.id)
        .order_by(ActivityLog.created_at.desc())
        .limit(8)
        .all()
    )

    return DashboardStats(
        total_tasks=total,
        completed_tasks=completed,
        pending_tasks=pending,
        overdue_tasks=overdue,
        completion_percentage=completion_pct,
        by_status=by_status,
        by_priority=by_priority,
        recent_activities=recent,
    )
