"""AI chat — Groq (primary) → Gemini → Ollama → Anthropic (fallbacks)."""
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


def _build_system(user: User, tasks) -> str:
    tasks_ctx = "\n".join(
        f"- [{t.status.value.upper()}] {t.title} "
        f"(priority={t.priority.value}, due={t.due_date.date() if t.due_date else 'none'})"
        for t in tasks
    ) or "No tasks yet."
    return (
        f"You are TaskFlow AI — a friendly, concise productivity assistant inside TaskFlow.\n"
        f"User: {user.full_name}\n\n"
        f"Their tasks:\n{tasks_ctx}\n\n"
        f"Help with task management, priorities, productivity tips, and TaskFlow features. "
        f"Keep replies under 150 words. Be warm and actionable."
    )


def _chat_groq(system: str, messages: List[ChatMessage]) -> str:
    import httpx
    payload = {
        "model": settings.GROQ_MODEL,
        "messages": [{"role": "system", "content": system}]
        + [{"role": m.role, "content": m.content} for m in messages],
        "max_tokens": 512,
        "temperature": 0.7,
    }
    resp = httpx.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"]


def _chat_gemini(system: str, messages: List[ChatMessage]) -> str:
    import httpx
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
    )
    contents = []
    for m in messages:
        role = "user" if m.role == "user" else "model"
        contents.append({"role": role, "parts": [{"text": m.content}]})

    payload = {
        "system_instruction": {"parts": [{"text": system}]},
        "contents": contents,
        "generationConfig": {"maxOutputTokens": 512, "temperature": 0.7},
    }
    resp = httpx.post(url, json=payload, timeout=30)
    resp.raise_for_status()
    return resp.json()["candidates"][0]["content"]["parts"][0]["text"]


def _chat_ollama(system: str, messages: List[ChatMessage]) -> str:
    import httpx
    payload = {
        "model": settings.OLLAMA_MODEL,
        "messages": [{"role": "system", "content": system}]
        + [{"role": m.role, "content": m.content} for m in messages],
        "stream": False,
    }
    resp = httpx.post(
        f"{settings.OLLAMA_BASE_URL}/api/chat",
        headers={"Authorization": f"Bearer {settings.OLLAMA_API_KEY}"},
        json=payload,
        timeout=60,
        follow_redirects=True,
    )
    resp.raise_for_status()
    return resp.json()["message"]["content"]


def _chat_anthropic(system: str, messages: List[ChatMessage]) -> str:
    import anthropic
    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    resp = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=512,
        system=system,
        messages=[{"role": m.role, "content": m.content} for m in messages],
    )
    return resp.content[0].text


@router.post("", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    has_groq = bool(settings.GROQ_API_KEY)
    has_gemini = bool(settings.GEMINI_API_KEY)
    has_ollama = bool(settings.OLLAMA_API_KEY)
    has_anthropic = bool(settings.ANTHROPIC_API_KEY)

    if not any([has_groq, has_gemini, has_ollama, has_anthropic]):
        raise HTTPException(
            status_code=503,
            detail="AI not configured. Add GROQ_API_KEY to backend/.env",
        )

    tasks = (
        db.query(Task)
        .filter((Task.owner_id == current_user.id) | (Task.assignee_id == current_user.id))
        .order_by(Task.created_at.desc())
        .limit(50)
        .all()
    )
    system = _build_system(current_user, tasks)

    providers = []
    if has_groq:
        providers.append(("Groq", _chat_groq))
    if has_gemini:
        providers.append(("Gemini", _chat_gemini))
    if has_ollama:
        providers.append(("Ollama", _chat_ollama))
    if has_anthropic:
        providers.append(("Anthropic", _chat_anthropic))

    last_err = None
    for name, fn in providers:
        try:
            return {"message": fn(system, payload.messages)}
        except Exception as e:
            last_err = e
            continue

    raise HTTPException(status_code=500, detail=f"AI error: {last_err}")
