import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

class ConceptMastery(Base):
    __tablename__ = "concept_masteries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    subject = Column(String(100), nullable=False, index=True)
    concept_name = Column(String(255), nullable=False, index=True)
    mastery_percentage = Column(Float, default=50.0)  # 0.0 - 100.0%
    attempts = Column(Integer, default=1)
    correct_count = Column(Integer, default=0)
    last_studied_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="concept_masteries")

class LearningPath(Base):
    __tablename__ = "learning_paths"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    title = Column(String(255), nullable=False)
    subject = Column(String(100), nullable=False)
    nodes = Column(JSON, default=list)  # [{"id": "node-1", "title": "...", "status": "completed" | "active" | "locked", "prerequisites": []}]
    current_node_id = Column(String(50), default="")
    overall_progress = Column(Float, default=0.0)  # 0 - 100%
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="learning_paths")
