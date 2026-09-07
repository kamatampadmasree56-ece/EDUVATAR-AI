# EDUVATAR AI — Production Deployment Guide

This guide covers deploying **EDUVATAR AI** to production across multiple hosting options:

1. **Option 1: Modern Cloud Stack (Recommended)**: Vercel (Frontend) + Render / Railway (Backend) + Neon / Render (PostgreSQL)
2. **Option 2: Docker & Docker Compose (Self-Hosted / VPS / AWS EC2 / DigitalOcean)**
3. **Option 3: Single PaaS Container (Fly.io / Railway)**

---

## Architecture Overview

```
 ┌───────────────────────────┐         ┌───────────────────────────────┐
 │   Frontend (React/Vite)   │         │     Backend (FastAPI / Py)    │
 │      Hosted on Vercel     │ ──API─► │      Hosted on Render/VPS     │
 │  (https://app.example.com)│ ◄──WS── │  (https://api.example.com)    │
 └───────────────────────────┘         └──────────────┬────────────────┘
                                                      │
                                                      ▼
                                       ┌───────────────────────────────┐
                                       │   PostgreSQL + Vector DB      │
                                       │  (Neon / Supabase / Render)   │
                                       └───────────────────────────────┘
```

---

## 1. Option 1: Vercel (Frontend) + Render (Backend)

### A. Deploy Backend to Render

1. Create an account on [Render.com](https://render.com).
2. Connect your GitHub repository (`EDUVATAR-AI`).
3. Click **New +** -> **Blueprint** and select your repository. Render will automatically detect [`render.yaml`](file:///render.yaml) in the root.
4. Alternatively, create a **Web Service** manually:
   - **Root Directory**: `backend` (or repo root)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt` (if root: `pip install -r backend/requirements.txt`)
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT` (if root: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`)
5. Configure Environment Variables in Render:
   | Variable | Value / Description |
   |---|---|
   | `ENVIRONMENT` | `production` |
   | `DATABASE_URL` | PostgreSQL connection string from Render Postgres, Neon, or Supabase |
   | `JWT_SECRET` | 32+ character random string |
   | `CORS_ORIGINS` | `https://your-frontend.vercel.app,http://localhost:5173` |
   | `LLM_PROVIDER` | `gemini` (or `openai` / `demo`) |
   | `LLM_API_KEY` | Your Gemini or OpenAI API Key |
   | `EMBEDDING_PROVIDER` | `gemini` (or `openai` / `demo`) |
   | `EMBEDDING_API_KEY` | Your Gemini or OpenAI API Key |
   | `STORAGE_TYPE` | `local` (or configure S3 bucket) |

---

### B. Deploy Frontend to Vercel

1. Create an account on [Vercel.com](https://vercel.com).
2. Click **Add New...** -> **Project** and import your repository.
3. Configure Project Settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variables in Vercel:
   | Variable | Value |
   |---|---|
   | `VITE_API_URL` | `https://your-backend.onrender.com` (your deployed backend URL) |
5. Click **Deploy**. Vercel uses the included [`vercel.json`](file:///vercel.json) to handle Single Page Application (SPA) routing and security headers.

---

## 2. Option 2: Docker Compose (VPS / AWS / DigitalOcean)

The repository includes production-ready Dockerfiles for both backend and frontend:
- [`backend/Dockerfile`](file:///backend/Dockerfile)
- [`frontend/Dockerfile`](file:///frontend/Dockerfile) (Multi-stage build with Nginx)
- [`docker-compose.yml`](file:///docker-compose.yml)

### Step 1: Clone repo on VPS
```bash
git clone https://github.com/your-org/EDUVATAR-AI.git
cd EDUVATAR-AI
```

### Step 2: Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
nano .env
```
Update `JWT_SECRET`, `LLM_API_KEY`, and `CORS_ORIGINS`.

### Step 3: Run with Docker Compose
```bash
docker compose up -d --build
```

### Verification:
- Frontend: `http://<your-server-ip>:5173`
- Backend API Docs: `http://<your-server-ip>:8000/docs`
- Healthcheck: `http://<your-server-ip>:8000/health`

---

## 3. Database Migration & Initialization

On initial deployment, the database tables and default admin/demo teacher content (such as Ohm's Law and Electrostatics lessons) are automatically initialized by the FastAPI startup handler in [`backend/app/main.py`](file:///backend/app/main.py).

For PostgreSQL production instances:
- Enable `pgvector` extension if using vector similarity search:
  ```sql
  CREATE EXTENSION IF NOT EXISTS vector;
  ```

---

## 4. Production Checklist

- [ ] `JWT_SECRET` generated securely (`openssl rand -hex 32`)
- [ ] `CORS_ORIGINS` updated to include your production frontend domain
- [ ] AI API keys configured (`LLM_API_KEY`, `EMBEDDING_API_KEY`)
- [ ] HTTPS enabled (automatic on Vercel and Render)
- [ ] Speech & microphone permissions allowed on browser client
