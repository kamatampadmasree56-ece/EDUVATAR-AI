from typing import Optional, List, Dict, Any
from pydantic import BaseModel
import datetime

class QuestionOption(BaseModel):
    id: str
    text: str

class QuestionSchema(BaseModel):
    id: Optional[int] = None
    question_type: str = "mcq"  # mcq, short_answer, numerical, conceptual
    question_text: str
    options: List[QuestionOption] = []
    correct_answer: str
    explanation: str
    difficulty: str = "medium"
    concept_tested: str

    class Config:
        from_attributes = True

class LessonSectionSchema(BaseModel):
    id: Optional[int] = None
    section_index: int
    title: str
    concept: str
    explanation_text: str
    example_text: Optional[str] = ""
    analogy_text: Optional[str] = ""
    prerequisites: List[str] = []
    importance: str = "high"
    status: str = "not_started"
    scenes: List[Dict[str, Any]] = []
    visual_type: str = "katex"  # katex, svg_diagram, mermaid, code, timeline, flowchart, circuit_simulation, neural_net, speedometer, energy_diagram, dna_helix
    visual_data: Dict[str, Any] = {}
    visual_caption: Optional[str] = ""
    key_points: List[str] = []
    narration_script: Optional[str] = ""
    estimated_minutes: int = 3
    questions: List[QuestionSchema] = []

    class Config:
        from_attributes = True

class LessonCreateRequest(BaseModel):
    mode: str = "topic"  # 'topic' or 'material'
    learning_mode: str = "complete_learning"  # complete_learning, quick_overview, exam_prep, revision, deep_dive, chapter_mode
    title: Optional[str] = None
    topic: Optional[str] = None
    subject: Optional[str] = "General"
    document_id: Optional[int] = None
    chapter: Optional[str] = None
    target_level: str = "Beginner"  # Beginner, Intermediate, Advanced
    duration_minutes: int = 15
    language: str = "English"  # English, Hindi, Hinglish, Telugu, Tamil, Kannada
    teaching_style: str = "Friendly Mentor"  # Professor, Friendly Mentor, Strict Exam Coach, Patient Tutor, Coding Mentor
    learning_objective: Optional[str] = None

class LessonResponse(BaseModel):
    id: int
    user_id: int
    document_id: Optional[int] = None
    title: str
    subject: str
    learning_objective: str
    learning_mode: Optional[str] = "complete_learning"
    target_level: str
    duration_minutes: int
    language: str
    teaching_style: str
    total_sections: int
    current_section_index: int
    current_mastery: float
    status: str
    curriculum_summary: Dict[str, Any] = {}
    sections: List[LessonSectionSchema] = []
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class LessonDetailResponse(LessonResponse):
    pass

class AnswerSubmissionRequest(BaseModel):
    student_answer: str
    response_time_seconds: Optional[float] = 5.0

class EvaluationResultResponse(BaseModel):
    is_correct: bool
    confidence: float = 0.8
    detected_misconception: Optional[str] = None
    ai_feedback: str
    adaptation_action: str = "CONTINUE"
    remedial_analogy: Optional[str] = None
    remedial_visual: Optional[Dict[str, Any]] = None
    updated_mastery: float = 50.0
    next_action: str = "CONTINUE"


