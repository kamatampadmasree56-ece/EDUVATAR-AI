import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database.session import engine, Base, SessionLocal
from app.routers.auth import ensure_demo_user, router as auth_router
from app.routers.documents import router as documents_router
from app.routers.lessons import router as lessons_router
from app.routers.teaching import router as teaching_router
from app.routers.assessments import router as assessments_router
from app.routers.analytics import router as analytics_router
from app.routers.learning_paths import router as learning_paths_router
from app.routers.speech import router as speech_router
from app.routers.video import router as video_router
from app.routers.demo import router as demo_router, seed_ohms_law
from app.utils.logger import logger

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database tables are created
    logger.info("Initializing database schemas...")
    Base.metadata.create_all(bind=engine)
    
    # Ensure demo user and demo Ohm's law lesson exist
    db = SessionLocal()
    try:
        logger.info("Verifying default student account and pedagogical curricula...")
        demo_user = ensure_demo_user(db)
        try:
            seed_ohms_law(db, demo_user.id)
        except Exception as seed_err:
            logger.warning(f"Ohm's Law seed skipped (may already exist): {seed_err}")
            db.rollback()
    except Exception as e:
        logger.error(f"Error during database startup seed: {e}")
    finally:
        db.close()

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    yield
    # Shutdown
    logger.info("EDUVATAR AI backend shut down gracefully.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="The Adaptive AI Teacher — Complete pedagogical platform combining RAG, modular agents, and human-like interactive video instruction.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
origins = settings.cors_origins_list
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.ENVIRONMENT == "development" else origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory for static file access if needed
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth_router)
app.include_router(documents_router)
app.include_router(lessons_router)
app.include_router(teaching_router)
app.include_router(assessments_router)
app.include_router(analytics_router)
app.include_router(learning_paths_router)
app.include_router(speech_router)
app.include_router(video_router)
app.include_router(demo_router)

@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "llm_provider": settings.LLM_PROVIDER,
        "avatar_provider": settings.AVATAR_PROVIDER
    }
