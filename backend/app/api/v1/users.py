"""User profile endpoints."""
import os
import uuid
from typing import List

from fastapi import (APIRouter, Depends, File, HTTPException, UploadFile,
                    status)
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_admin, get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserOut, UserUpdate
from app.services.activity import log_activity

router = APIRouter(prefix="/users", tags=["Users"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


@router.put("/me", response_model=UserOut)
def update_profile(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    updates = payload.model_dump(exclude_unset=True)
    if "username" in updates:
        existing = db.query(User).filter(
            User.username == updates["username"], User.id != current_user.id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
    for key, value in updates.items():
        setattr(current_user, key, value)
    db.commit()
    db.refresh(current_user)
    log_activity(db, current_user.id, "updated_profile", "user", current_user.id)
    return current_user


@router.post("/me/avatar", response_model=UserOut)
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    contents = await file.read()
    if len(contents) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename or "")[1] or ".png"
    fname = f"avatar_{current_user.id}_{uuid.uuid4().hex[:8]}{ext}"
    path = os.path.join(settings.UPLOAD_DIR, fname)
    with open(path, "wb") as f:
        f.write(contents)

    current_user.avatar_url = f"/{settings.UPLOAD_DIR}/{fname}"
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("", response_model=List[UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Used for assigning tasks and @mentions."""
    return db.query(User).filter(User.is_active == True).all()  # noqa: E712


@router.get("/admin/all", response_model=List[UserOut])
def admin_list_all(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin),
):
    return db.query(User).all()
