"""Aggregate all v1 routers."""
from fastapi import APIRouter

from app.api.v1 import auth, collaboration, dashboard, tasks, users

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(tasks.router)
api_router.include_router(dashboard.router)
api_router.include_router(users.router)
api_router.include_router(collaboration.router)
