"""FastAPI application entrypoint."""
import os
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models import User, UserRole  # noqa: F401  (ensures models are registered)

# Create tables on startup (use Alembic for production migrations)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="2.0.0",
    description="TaskFlow — a full-featured task management API with bulk operations, advanced filtering, and AI chat.",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Compress responses larger than 1KB
app.add_middleware(GZipMiddleware, minimum_size=1000)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    response.headers["X-Process-Time"] = f"{(time.perf_counter() - start) * 1000:.2f}ms"
    return response

# Serve uploaded files
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount(f"/{settings.UPLOAD_DIR}", StaticFiles(directory=settings.UPLOAD_DIR),
          name="uploads")

app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
def root():
    return {"app": settings.PROJECT_NAME, "status": "running", "docs": "/docs"}


@app.get("/health")
def health():
    """Health check including database connectivity."""
    db = SessionLocal()
    try:
        db.execute(__import__("sqlalchemy").text("SELECT 1"))
        db_status = "healthy"
    except Exception as exc:
        db_status = f"unhealthy: {exc}"
    finally:
        db.close()

    status = "healthy" if db_status == "healthy" else "degraded"
    code = 200 if status == "healthy" else 503
    return JSONResponse(
        content={"status": status, "database": db_status, "version": "2.0.0"},
        status_code=code,
    )


@app.on_event("startup")
def seed_admin():
    """Create a default admin account if none exists."""
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.role == UserRole.admin).first():
            admin = User(
                full_name="Admin",
                username="admin",
                email="admin@taskflow.app",
                hashed_password=hash_password("admin123"),
                role=UserRole.admin,
            )
            db.add(admin)
            db.commit()
            print("[SEED] Default admin created -> admin@taskflow.app / admin123")
    finally:
        db.close()
