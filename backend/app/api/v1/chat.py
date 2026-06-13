"""AI chat endpoint powered by Anthropic Claude."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.models.task import Task
from app.models.user import User

router = APIRouter(prefix="/chat", tags=["Chat"])


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]


class ChatResponse(BaseModel):
    message: str


@router.post("", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not settings.ANTHROPIC_API_KEY:
        raise HTTPException(status_code=503, detail="AI service not configured. Add ANTHROPIC_API_KEY to .env")

    tasks = (
        db.query(Task)
        .filter((Task.owner_id == current_user.id) | (Task.assignee_id == current_user.id))
        .order_by(Task.created_at.desc())
        .limit(50)
        .all()
    )

    tasks_ctx = "\n".join(
        f"- [{t.status.value.upper()}] {t.title} "
        f"(priority={t.priority.value}, due={t.due_date.date() if t.due_date else 'none'})"
        for t in tasks
    ) or "No tasks yet."

    system = (
        f"You are TaskFlow AI — a friendly, concise productivity assistant inside TaskFlow.\n"
        f"User: {current_user.full_name}\n\n"
        f"Their tasks:\n{tasks_ctx}\n\n"
        f"Help with task management, priorities, productivity tips, and TaskFlow features "
        f"(Dashboard, Kanban board, Calendar, Analytics). "
        f"Keep replies under 150 words. Be warm and actionable."
    )

    try:
        import anthropic
        client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        resp = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=512,
            system=system,
            messages=[{"role": m.role, "content": m.content} for m in payload.messages],
        )
        return {"message": resp.content[0].text}
    except ImportError:
        raise HTTPException(status_code=503, detail="anthropic package not installed. Run: pip install anthropic")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")
