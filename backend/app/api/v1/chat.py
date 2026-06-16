"""AI chat — DeepSeek (primary) → Groq → Gemini → Ollama → Anthropic (fallbacks)."""
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.models.collaboration import ActivityLog, Notification, Workspace, WorkspaceMember
from app.models.task import Task, TaskStatus
from app.models.user import User

router = APIRouter(prefix="/chat", tags=["Chat"])


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]


class ChatResponse(BaseModel):
    message: str


def _build_system(user: User, db: Session) -> str:
    # ── Tasks (with description, tags, comments) ──────────────────────────────
    tasks = (
        db.query(Task)
        .filter((Task.owner_id == user.id) | (Task.assignee_id == user.id))
        .order_by(Task.created_at.desc())
        .limit(50)
        .all()
    )

    now = datetime.utcnow()
    total = len(tasks)
    completed = sum(1 for t in tasks if t.status == TaskStatus.completed)
    in_progress = sum(1 for t in tasks if t.status == TaskStatus.in_progress)
    todo = sum(1 for t in tasks if t.status == TaskStatus.todo)
    overdue = sum(
        1 for t in tasks
        if t.due_date and t.due_date < now and t.status != TaskStatus.completed
    )
    completion_rate = round((completed / total * 100) if total else 0, 1)

    tasks_ctx = ""
    for t in tasks:
        comments_txt = ""
        if t.comments:
            comments_txt = " | Comments: " + "; ".join(
                f'"{c.content}"' for c in t.comments[-3:]
            )
        tasks_ctx += (
            f"- [{t.status.value.upper()}] {t.title}"
            f" (priority={t.priority.value}"
            f", due={t.due_date.date() if t.due_date else 'none'}"
            f", tags={t.tags or 'none'}"
            f"{', OVERDUE' if t.due_date and t.due_date < now and t.status != TaskStatus.completed else ''})"
            f"{f' | Desc: {t.description[:100]}' if t.description else ''}"
            f"{comments_txt}\n"
        )

    # ── Dashboard stats ────────────────────────────────────────────────────────
    stats_ctx = (
        f"Total: {total} | Completed: {completed} | In Progress: {in_progress} "
        f"| Todo: {todo} | Overdue: {overdue} | Completion Rate: {completion_rate}%"
    )

    # ── Workspaces ─────────────────────────────────────────────────────────────
    memberships = (
        db.query(WorkspaceMember)
        .filter(WorkspaceMember.user_id == user.id)
        .all()
    )
    workspace_ids = [m.workspace_id for m in memberships]
    workspaces = db.query(Workspace).filter(Workspace.id.in_(workspace_ids)).all() if workspace_ids else []
    workspaces_ctx = "\n".join(
        f"- {w.name} (role={next((m.role for m in memberships if m.workspace_id == w.id), 'member')})"
        f"{f': {w.description}' if w.description else ''}"
        for w in workspaces
    ) or "No workspaces."

    # ── Recent activity logs ───────────────────────────────────────────────────
    activities = (
        db.query(ActivityLog)
        .filter(ActivityLog.user_id == user.id)
        .order_by(ActivityLog.created_at.desc())
        .limit(10)
        .all()
    )
    activity_ctx = "\n".join(
        f"- {a.action} {a.entity or ''}: {a.detail or ''} ({a.created_at.strftime('%Y-%m-%d')})"
        for a in activities
    ) or "No recent activity."

    # ── Unread notifications ───────────────────────────────────────────────────
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == user.id, Notification.is_read == False)
        .order_by(Notification.created_at.desc())
        .limit(5)
        .all()
    )
    notif_ctx = "\n".join(
        f"- {n.title}: {n.message or ''}"
        for n in notifications
    ) or "No unread notifications."

    return (
        f"You are TaskFlow AI — a smart, friendly productivity assistant inside TaskFlow.\n"
        f"User: {user.full_name} (email: {user.email})\n\n"
        f"=== DASHBOARD STATS ===\n{stats_ctx}\n\n"
        f"=== ALL TASKS ===\n{tasks_ctx}\n"
        f"=== WORKSPACES ===\n{workspaces_ctx}\n\n"
        f"=== RECENT ACTIVITY (last 10) ===\n{activity_ctx}\n\n"
        f"=== UNREAD NOTIFICATIONS ===\n{notif_ctx}\n\n"
        f"You have FULL knowledge of the user's TaskFlow dashboard. "
        f"Help with task management, priorities, productivity tips, and TaskFlow features. "
        f"Keep replies under 200 words. Be warm, specific, and actionable."
    )


def _chat_deepseek(system: str, messages: List[ChatMessage]) -> str:
    import httpx
    payload = {
        "model": settings.DEEPSEEK_MODEL,
        "messages": [{"role": "system", "content": system}]
        + [{"role": m.role, "content": m.content} for m in messages],
        "max_tokens": 512,
        "temperature": 0.7,
    }
    resp = httpx.post(
        "https://api.deepseek.com/chat/completions",
        headers={
            "Authorization": f"Bearer {settings.DEEPSEEK_API_KEY}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"]


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
    has_deepseek = bool(settings.DEEPSEEK_API_KEY)
    has_groq = bool(settings.GROQ_API_KEY)
    has_gemini = bool(settings.GEMINI_API_KEY)
    has_ollama = bool(settings.OLLAMA_API_KEY)
    has_anthropic = bool(settings.ANTHROPIC_API_KEY)

    if not any([has_deepseek, has_groq, has_gemini, has_ollama, has_anthropic]):
        raise HTTPException(
            status_code=503,
            detail="AI not configured. Add DEEPSEEK_API_KEY to backend/.env",
        )

    system = _build_system(current_user, db)

    providers = []
    if has_deepseek:
        providers.append(("DeepSeek", _chat_deepseek))
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
