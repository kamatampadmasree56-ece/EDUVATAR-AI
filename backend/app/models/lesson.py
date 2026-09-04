import datetime
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    
    title = Column(String(255), nullable=False)
    subject = Column(String(100), default="General")
    learning_objective = Column(Text, nullable=False)
    learning_mode = Column(String(50), default="complete_learning")  # complete_learning, quick_overview, exam_prep, revision, deep_dive, chapter_mode
    target_level = Column(String(50), default="Beginner")  # Beginner, Intermediate, Advanced
    duration_minutes = Column(Integer, default=15)
    language = Column(String(50), default="English")
    teaching_style = Column(String(50), default="Friendly Mentor")
    
    total_sections = Column(Integer, default=1)
    current_section_index = Column(Integer, default=0)
    current_mastery = Column(Float, default=50.0)  # 0 to 100%
    status = Column(String(50), default="in_progress")  # in_progress, completed
    curriculum_summary = Column(JSON, default=dict)  # {"total_concepts": 16, "completed_concepts_count": 0, "continuation_plan": "..."}
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="lessons")
    sections = relationship("LessonSection", back_populates="lesson", order_by="LessonSection.section_index", cascade="all, delete-orphan")
    responses = relationship("StudentResponse", back_populates="lesson", cascade="all, delete-orphan")

class LessonSection(Base):
    __tablename__ = "lesson_sections"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False, index=True)
    
    section_index = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    concept = Column(String(255), nullable=False)
    explanation_text = Column(Text, nullable=False)
    example_text = Column(Text, default="")
    analogy_text = Column(Text, default="")
    
    # Complete Topic attributes
    prerequisites = Column(JSON, default=list)  # ["Concept 1", "Concept 2"]
    importance = Column(String(50), default="high")  # essential, high, medium, advanced
    status = Column(String(50), default="not_started")  # not_started, in_progress, completed, review_needed, locked
    scenes = Column(JSON, default=list)  # Multi-scene video lesson structure
    
    # Subject-aware visual
    visual_type = Column(String(50), default="katex")  # katex, svg_diagram, mermaid, code, timeline, flowchart, circuit_simulation, neural_net, speedometer, energy_diagram, dna_helix
    visual_data = Column(JSON, default=dict)
    visual_caption = Column(String(255), default="")
    
    key_points = Column(JSON, default=list)  # ["V = IR", "Current is directly proportional to voltage"]
    narration_script = Column(Text, default="")
    estimated_minutes = Column(Integer, default=3)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    lesson = relationship("Lesson", back_populates="sections")
    questions = relationship("Question", back_populates="section", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False, index=True)
    section_id = Column(Integer, ForeignKey("lesson_sections.id"), nullable=True)
    
    question_type = Column(String(50), default="mcq")  # mcq, short_answer, numerical, conceptual
    question_text = Column(Text, nullable=False)
    options = Column(JSON, default=list)  # [{"id": "A", "text": "..."}, ...]
    correct_answer = Column(String(255), nullable=False)
    explanation = Column(Text, nullable=False)
    difficulty = Column(String(50), default="medium")  # easy, medium, hard
    concept_tested = Column(String(255), nullable=False)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    section = relationship("LessonSection", back_populates="questions")
    responses = relationship("StudentResponse", back_populates="question", cascade="all, delete-orphan")

class StudentResponse(Base):
    __tablename__ = "student_responses"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    student_answer = Column(Text, nullable=False)
    is_correct = Column(Boolean, default=False)
    confidence = Column(Float, default=0.8)
    detected_misconception = Column(Text, nullable=True)
    ai_feedback = Column(Text, nullable=False)
    adaptation_action = Column(String(50), default="CONTINUE")  # CONTINUE, SIMPLIFY, REEXPLAIN, NEW_ANALOGY, INCREASE_DIFFICULTY
    response_time_seconds = Column(Float, default=5.0)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    lesson = relationship("Lesson", back_populates="responses")
    question = relationship("Question", back_populates="responses")
