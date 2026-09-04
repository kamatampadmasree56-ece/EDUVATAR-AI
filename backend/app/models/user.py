import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    profile = relationship("LearnerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    lessons = relationship("Lesson", back_populates="user", cascade="all, delete-orphan")
    concept_masteries = relationship("ConceptMastery", back_populates="user", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="user", cascade="all, delete-orphan")
    learning_paths = relationship("LearningPath", back_populates="user", cascade="all, delete-orphan")

class LearnerProfile(Base):
    __tablename__ = "learner_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    education_level = Column(String(50), default="High School")  # Middle School, High School, Undergraduate, Professional
    subject_interests = Column(JSON, default=list)  # ["Physics", "Computer Science", "Mathematics"]
    current_knowledge = Column(String(50), default="Beginner")   # Beginner, Intermediate, Advanced
    learning_goal = Column(String(255), default="Master core principles and prepare for exams")
    preferred_language = Column(String(50), default="English")   # English, Hindi, Hinglish, Telugu, Tamil, Kannada
    teaching_style = Column(String(50), default="Friendly Mentor") # Professor, Friendly Mentor, Strict Exam Coach, Patient Tutor, Coding Mentor
    available_daily_time = Column(Integer, default=20)           # in minutes
    difficulty_preference = Column(String(50), default="Adaptive") # Easy, Adaptive, Challenging
    
    # Progress counters
    study_streak_days = Column(Integer, default=1)
    total_study_minutes = Column(Integer, default=0)
    completed_lessons_count = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="profile")
