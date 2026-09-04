import datetime
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=True, index=True)
    
    title = Column(String(255), nullable=False)
    subject = Column(String(100), default="General")
    total_score = Column(Float, default=0.0)  # in percentage e.g. 85.0
    score = Column(Float, default=0.0)
    total_points = Column(Integer, default=30)
    passing_score = Column(Float, default=70.0)
    status = Column(String(50), default="pending")
    passed = Column(Boolean, default=True)
    
    strong_concepts = Column(JSON, default=list)      # ["Current", "Voltage"]
    weak_concepts = Column(JSON, default=list)        # ["Resistance", "Ohm's Law"]
    misconceptions = Column(JSON, default=list)       # ["Current increases with resistance"]
    recommended_revision = Column(Text, default="")  # "Revise Ohm's Law and solve 3 additional problems"
    recommended_next_topic = Column(String(255), default="")
    
    detailed_report = Column(JSON, default=dict)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="assessments")
    questions = relationship("AssessmentQuestion", back_populates="assessment", cascade="all, delete-orphan")

class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False, index=True)
    question_order = Column(Integer, default=1)
    
    question_text = Column(Text, nullable=False)
    question_type = Column(String(50), default="mcq")
    options = Column(JSON, default=list)
    correct_answer = Column(String(255), nullable=False)
    student_answer = Column(String(255), default="")
    is_correct = Column(Boolean, default=False)
    concept = Column(String(255), default="")
    concept_tested = Column(String(255), default="")
    explanation = Column(Text, default="")
    points = Column(Integer, default=10)
    
    assessment = relationship("Assessment", back_populates="questions")

