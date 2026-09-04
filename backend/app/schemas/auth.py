from typing import Optional, List
from pydantic import BaseModel
import datetime

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    education_level: Optional[str] = "High School"
    subject_interests: Optional[List[str]] = ["Physics", "Computer Science"]
    current_knowledge: Optional[str] = "Beginner"
    learning_goal: Optional[str] = "Master core concepts"
    preferred_language: Optional[str] = "English"
    teaching_style: Optional[str] = "Friendly Mentor"
    available_daily_time: Optional[int] = 20
    difficulty_preference: Optional[str] = "Adaptive"

class UserLogin(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class LearnerProfileResponse(BaseModel):
    id: int
    education_level: str
    subject_interests: List[str]
    current_knowledge: str
    learning_goal: str
    preferred_language: str
    teaching_style: str
    available_daily_time: int
    difficulty_preference: str
    study_streak_days: int
    total_study_minutes: int
    completed_lessons_count: int

    class Config:
        from_attributes = True

class LearnerProfileUpdate(BaseModel):
    education_level: Optional[str] = None
    subject_interests: Optional[List[str]] = None
    current_knowledge: Optional[str] = None
    learning_goal: Optional[str] = None
    preferred_language: Optional[str] = None
    teaching_style: Optional[str] = None
    available_daily_time: Optional[int] = None
    difficulty_preference: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    profile: Optional[LearnerProfileResponse] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

TokenResponse.model_rebuild()
