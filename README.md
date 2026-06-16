# TaskFlow — Full-Stack Task Management System

A production-style task manager built with **React + FastAPI + PostgreSQL**.
JWT auth, role-based access, a live analytics dashboard, task CRUD with
search/filter/sort, profiles with avatar upload, comments with `@mentions`,
in-app notifications, activity logs, workspaces, and smooth Framer Motion
animations throughout.

---

## ✨ Features

**Auth & Authorization**
- Register / Login / Logout
- JWT authentication, bcrypt password hashing
- Forgot password + reset via email (dev mode logs the link to console)
- Change password
- Protected routes + Role-Based Access Control (admin / user)

**Tasks**
- Create / Read / Update / Delete
- Title, description, due date, priority (low/medium/high), status (todo/in-progress/completed), tags
- Search by title/description, filter by status & priority, sort by date/priority/title
- One-click complete toggle

**Dashboard**
- Total / Completed / Pending / Overdue counts
- Completion percentage with animated progress bar
- Pie chart (by status) + Bar chart (by priority) via Recharts
- Recent activity feed

**Profile**
- Update profile + bio
- Upload profile picture
- Change password
- Account settings

**Collaboration & more**
- Workspaces + invite members
- Comments on tasks with `@username` mentions
- In-app notifications (bell with unread badge)
- Activity / audit logs
- File attachments on tasks

---

## 🗂 Folder Structure

```
task-management-system/
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI app, CORS, static, seed admin
│   │   ├── core/                  # config, database, security (JWT + bcrypt)
│   │   ├── models/                # SQLAlchemy models
│   │   ├── schemas/               # Pydantic schemas
│   │   ├── api/
│   │   │   ├── deps.py            # current-user + RBAC dependencies
│   │   │   └── v1/                # auth, tasks, dashboard, users, collaboration
│   │   └── services/              # email, activity logging
│   ├── alembic/                   # DB migrations
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/                   # axios client + endpoints
│   │   ├── context/               # AuthContext
│   │   ├── components/            # Layout, AuthShell, Input, TaskModal
│   │   └── pages/                 # Login, Register, Forgot/Reset, Dashboard, Tasks, Profile
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quick Start (Docker — easiest)

Requires Docker + Docker Compose.

```bash
docker compose up --build
```

- Frontend → http://localhost:5173
- Backend API docs → http://localhost:8000/docs


---

## 🛠 Manual Setup

### 1. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # edit DATABASE_URL + SECRET_KEY
uvicorn app.main:app --reload
```

Backend runs at http://localhost:8000 (docs at `/docs`).

> **Tip:** No PostgreSQL yet? You can test instantly with SQLite by setting
> `DATABASE_URL=sqlite:///./taskflow.db` in `.env`.

To create a Postgres database locally:
```bash
createdb taskflow      # or use psql / pgAdmin
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:5173 and proxies `/api` to the backend.

---

## 🔑 Environment Variables (backend/.env)

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `SECRET_KEY` | JWT signing key — generate with `openssl rand -hex 32` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime |
| `SMTP_*` | Email settings (leave blank → reset links print to console) |
| `FRONTEND_URL` | Used to build the reset-password link |

---

## 🗃 Database Migrations (Alembic)

Tables auto-create on startup for convenience. For production use migrations:

```bash
cd backend
alembic revision --autogenerate -m "init"
alembic upgrade head
```

---

## 📡 Key API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/auth/register` | Create account |
| POST | `/api/v1/auth/login-json` | Login (returns JWT) |
| POST | `/api/v1/auth/forgot-password` | Send reset link |
| POST | `/api/v1/auth/reset-password` | Reset with token |
| GET/POST | `/api/v1/tasks` | List / create tasks |
| PUT/DELETE | `/api/v1/tasks/{id}` | Update / delete task |
| GET | `/api/v1/dashboard/stats` | Dashboard analytics |
| PUT | `/api/v1/users/me` | Update profile |
| POST | `/api/v1/users/me/avatar` | Upload avatar |
| GET | `/api/v1/notifications` | List notifications |
| POST | `/api/v1/workspaces` | Create workspace |

Full interactive docs at **http://localhost:8000/docs**.

---

## 🧰 Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Recharts, Axios, React Router, react-hot-toast, lucide-react
- **Backend:** FastAPI, SQLAlchemy 2, Pydantic v2, python-jose (JWT), bcrypt, Alembic
- **Database:** PostgreSQL (SQLite supported for quick local dev)
- **Infra:** Docker + docker-compose, Nginx (frontend serving + API proxy)
