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
from app.routers.assessments import router as assessments_router, legacy_router as assessments_legacy_router
from app.routers.analytics import router as analytics_router
from app.routers.learning_paths import router as learning_paths_router
from app.routers.speech import router as speech_router
from app.routers.video import router as video_router
from app.routers.demo import (
    router as demo_router,
    seed_ohms_law,
    seed_pcb_design,
    seed_matlab_simulink,
    seed_analog_digital_circuits,
    seed_dcd_systems,
)
from app.utils.logger import logger

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database tables are created
    logger.info("Initializing database schemas...")

    # Apply safe runtime migrations for SQLite (development convenience)
    try:
        from sqlalchemy import inspect, text
        inspector = inspect(engine)
        if engine.dialect.name == "sqlite":
            tables = inspector.get_table_names()
            if 'lessons' in tables:
                cols = inspector.get_columns('lessons')
                col_names = [c['name'] for c in cols]
                if 'learning_mode' not in col_names:
                    logger.info("Applying lightweight migration: add 'learning_mode' column to lessons table")
                    with engine.connect() as conn:
                        conn.execute(text("ALTER TABLE lessons ADD COLUMN learning_mode VARCHAR(50) DEFAULT 'complete_learning'"))
                        conn.commit()
                if 'curriculum_summary' not in col_names:
                    logger.info("Applying lightweight migration: add 'curriculum_summary' column to lessons table")
                    with engine.connect() as conn:
                        conn.execute(text("ALTER TABLE lessons ADD COLUMN curriculum_summary JSON DEFAULT '{}'"))
                        conn.commit()
                # Check lesson_sections columns
                ls_cols = [c['name'] for c in inspector.get_columns('lesson_sections')] if 'lesson_sections' in tables else []
                to_add = []
                if 'prerequisites' not in ls_cols:
                    to_add.append("ALTER TABLE lesson_sections ADD COLUMN prerequisites JSON DEFAULT '[]'")
                if 'importance' not in ls_cols:
                    to_add.append("ALTER TABLE lesson_sections ADD COLUMN importance VARCHAR(50) DEFAULT 'high'")
                if 'status' not in ls_cols:
                    to_add.append("ALTER TABLE lesson_sections ADD COLUMN status VARCHAR(50) DEFAULT 'not_started'")
                if 'scenes' not in ls_cols:
                    to_add.append("ALTER TABLE lesson_sections ADD COLUMN scenes JSON DEFAULT '[]'")
                if 'visual_type' not in ls_cols:
                    to_add.append("ALTER TABLE lesson_sections ADD COLUMN visual_type VARCHAR(50) DEFAULT 'katex'")
                if 'visual_data' not in ls_cols:
                    to_add.append("ALTER TABLE lesson_sections ADD COLUMN visual_data JSON DEFAULT '{}'" )
                if 'visual_caption' not in ls_cols:
                    to_add.append("ALTER TABLE lesson_sections ADD COLUMN visual_caption VARCHAR(255) DEFAULT ''")
                if 'key_points' not in ls_cols:
                    to_add.append("ALTER TABLE lesson_sections ADD COLUMN key_points JSON DEFAULT '[]'")
                if 'narration_script' not in ls_cols:
                    to_add.append("ALTER TABLE lesson_sections ADD COLUMN narration_script TEXT DEFAULT ''")
                if 'estimated_minutes' not in ls_cols:
                    to_add.append("ALTER TABLE lesson_sections ADD COLUMN estimated_minutes INTEGER DEFAULT 3")

                if to_add:
                    logger.info(f"Applying lightweight migrations to lesson_sections: adding {len(to_add)} columns")
                    with engine.connect() as conn:
                        for stmt in to_add:
                            try:
                                conn.execute(text(stmt))
                            except Exception as e:
                                logger.warning(f"Migration statement failed: {e}")
                        conn.commit()
    except Exception as mig_err:
        logger.warning(f"Runtime migration skipped or failed: {mig_err}")

    Base.metadata.create_all(bind=engine)
    
    # Ensure demo user and demo ECE curriculum exist
    db = SessionLocal()
    try:
        logger.info("Verifying default student account and pedagogical curricula...")
        demo_user = ensure_demo_user(db)
        try:
            seed_ohms_law(db, demo_user.id)
            seed_pcb_design(db, demo_user.id, "Basic")
            seed_pcb_design(db, demo_user.id, "Advance")
            seed_pcb_design(db, demo_user.id, "High Level")
            seed_matlab_simulink(db, demo_user.id, "Basic")
            seed_matlab_simulink(db, demo_user.id, "Advance")
            seed_matlab_simulink(db, demo_user.id, "High Level")
            seed_analog_digital_circuits(db, demo_user.id, "Basic")
            seed_analog_digital_circuits(db, demo_user.id, "Advance")
            seed_analog_digital_circuits(db, demo_user.id, "High Level")
            seed_dcd_systems(db, demo_user.id, "Basic")
            seed_dcd_systems(db, demo_user.id, "Advance")
            seed_dcd_systems(db, demo_user.id, "High Level")
        except Exception as seed_err:
            logger.warning(f"ECE curriculum seed notice: {seed_err}")
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
app.include_router(assessments_legacy_router)
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
