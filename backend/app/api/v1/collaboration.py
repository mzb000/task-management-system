"""Collaboration endpoints: comments, attachments, notifications, activity, workspaces."""
import os
import re
import uuid
from typing import List

from fastapi import (APIRouter, Depends, File, HTTPException, UploadFile)
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.models.collaboration import (ActivityLog, Attachment, Comment,
                                      Notification, Workspace,
                                      WorkspaceMember)
from app.models.task import Task
from app.models.user import User
from app.schemas.task import (ActivityOut, AttachmentOut, CommentCreate,
                             CommentOut, NotificationOut, WorkspaceCreate,
                             WorkspaceOut)
from app.schemas.user import UserOut
from app.services.activity import create_notification, log_activity

router = APIRouter(tags=["Collaboration"])

MENTION_RE = re.compile(r"@(\w+)")


# ---------------- Comments ----------------
@router.post("/tasks/{task_id}/comments", response_model=CommentOut, status_code=201)
def add_comment(
    task_id: int,
    payload: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    mentioned = MENTION_RE.findall(payload.content)
    comment = Comment(
        content=payload.content,
        task_id=task_id,
        author_id=current_user.id,
        mentions=",".join(mentioned) if mentioned else None,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    # Notify mentioned users
    for username in set(mentioned):
        u = db.query(User).filter(User.username == username).first()
        if u and u.id != current_user.id:
            create_notification(
                db, u.id, "You were mentioned",
                f"{current_user.full_name} mentioned you on '{task.title}'",
                link=f"/tasks/{task_id}",
            )
    log_activity(db, current_user.id, "commented", "task", task_id, task.title)
    return comment


@router.get("/tasks/{task_id}/comments", response_model=List[CommentOut])
def list_comments(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Comment)
        .options(joinedload(Comment.author))
        .filter(Comment.task_id == task_id)
        .order_by(Comment.created_at.asc())
        .all()
    )


# ---------------- Attachments ----------------
@router.post("/tasks/{task_id}/attachments", response_model=AttachmentOut, status_code=201)
async def upload_attachment(
    task_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    contents = await file.read()
    if len(contents) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename or "")[1]
    fname = f"task{task_id}_{uuid.uuid4().hex[:8]}{ext}"
    path = os.path.join(settings.UPLOAD_DIR, fname)
    with open(path, "wb") as f:
        f.write(contents)

    attachment = Attachment(
        task_id=task_id,
        filename=file.filename or fname,
        file_url=f"/{settings.UPLOAD_DIR}/{fname}",
        content_type=file.content_type,
        size=len(contents),
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    log_activity(db, current_user.id, "uploaded_file", "task", task_id, file.filename)
    return attachment


@router.get("/tasks/{task_id}/attachments", response_model=List[AttachmentOut])
def list_attachments(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Attachment).filter(Attachment.task_id == task_id).all()


# ---------------- Notifications ----------------
@router.get("/notifications", response_model=List[NotificationOut])
def list_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )


@router.patch("/notifications/{notif_id}/read")
def mark_read(
    notif_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notif = db.query(Notification).filter(
        Notification.id == notif_id, Notification.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    return {"message": "marked read"}


@router.patch("/notifications/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id, Notification.is_read == False  # noqa: E712
    ).update({"is_read": True})
    db.commit()
    return {"message": "all marked read"}


# ---------------- Activity Logs ----------------
@router.get("/activity", response_model=List[ActivityOut])
def list_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(ActivityLog)
        .options(joinedload(ActivityLog.user))
        .filter(ActivityLog.user_id == current_user.id)
        .order_by(ActivityLog.created_at.desc())
        .limit(50)
        .all()
    )


# ---------------- Workspaces ----------------
@router.post("/workspaces", response_model=WorkspaceOut, status_code=201)
def create_workspace(
    payload: WorkspaceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ws = Workspace(**payload.model_dump(), owner_id=current_user.id)
    db.add(ws)
    db.commit()
    db.refresh(ws)
    db.add(WorkspaceMember(workspace_id=ws.id, user_id=current_user.id, role="owner"))
    db.commit()
    log_activity(db, current_user.id, "created_workspace", "workspace", ws.id, ws.name)
    return ws


@router.get("/workspaces", response_model=List[WorkspaceOut])
def list_workspaces(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    member_ws = db.query(WorkspaceMember.workspace_id).filter(
        WorkspaceMember.user_id == current_user.id
    ).subquery()
    return db.query(Workspace).filter(Workspace.id.in_(member_ws)).all()


@router.post("/workspaces/{ws_id}/invite", response_model=List[UserOut])
def invite_member(
    ws_id: int,
    email: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ws = db.query(Workspace).filter(Workspace.id == ws_id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User with that email not found")
    exists = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == ws_id, WorkspaceMember.user_id == user.id
    ).first()
    if not exists:
        db.add(WorkspaceMember(workspace_id=ws_id, user_id=user.id, role="member"))
        db.commit()
        create_notification(
            db, user.id, "Workspace invitation",
            f"{current_user.full_name} added you to '{ws.name}'",
        )
    members = (
        db.query(User)
        .join(WorkspaceMember, WorkspaceMember.user_id == User.id)
        .filter(WorkspaceMember.workspace_id == ws_id)
        .all()
    )
    return members
