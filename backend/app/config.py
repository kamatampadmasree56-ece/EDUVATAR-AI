import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "EDUVATAR AI"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = Field(
        default="sqlite:///./eduvatar.db",
        description="PostgreSQL URL for production or SQLite URL for development"
    )
    
    # JWT Authentication
    JWT_SECRET: str = "super-secret-change-in-production-eduvatar-ai-jwt-key-2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # AI Providers (demo, openai, gemini)
    LLM_PROVIDER: str = "demo"
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "gpt-4o-mini"
    
    EMBEDDING_PROVIDER: str = "demo"
    EMBEDDING_API_KEY: str = ""
    VECTOR_DATABASE_URL: str = ""
    
    # Speech Providers (browser, edge, openai, demo)
    STT_PROVIDER: str = "browser"
    STT_API_KEY: str = ""
    TTS_PROVIDER: str = "browser"
    TTS_API_KEY: str = ""
    
    # Avatar Providers (canvas, did, heygen, demo)
    AVATAR_PROVIDER: str = "canvas"
    AVATAR_API_KEY: str = ""
    
    # Video Providers
    VIDEO_PROVIDER: str = "demo"
    VIDEO_API_KEY: str = ""
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,https://eduvatar-ai.vercel.app"
    FRONTEND_URL: str = "http://localhost:5173"
    
    # Document Storage
    STORAGE_TYPE: str = "local"
    UPLOAD_DIR: str = "./uploads"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
