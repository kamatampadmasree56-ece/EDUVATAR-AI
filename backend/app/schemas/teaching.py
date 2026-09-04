from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class TeachingStartRequest(BaseModel):
    lesson_id: int

class TeachingResponseRequest(BaseModel):
    lesson_id: int
    question_id: int
    student_answer: str
    response_time_seconds: float = 5.0
    confidence: float = 0.8

class TeachingFeedbackResponse(BaseModel):
    is_correct: bool
    confidence: float
    detected_misconception: Optional[str] = None
    ai_feedback: str
    adaptation_action: str  # CONTINUE, SIMPLIFY, REEXPLAIN, NEW_ANALOGY, MORE_EXAMPLES, LOWER_DIFFICULTY, INCREASE_DIFFICULTY
    remedial_explanation: Optional[str] = None
    remedial_analogy: Optional[str] = None
    new_question: Optional[Dict[str, Any]] = None
    updated_mastery: float
    next_section_index: int
    is_lesson_completed: bool = False

class ContextualAskRequest(BaseModel):
    lesson_id: int
    current_section_index: int
    student_question: str

class ContextualAskResponse(BaseModel):
    teacher_reply: str
    concept_referenced: str
    source_citation: Optional[str] = None
    recommended_focus: Optional[str] = None

class AskTeacherRequest(BaseModel):
    lesson_id: int
    current_section_index: int = 0
    user_query: str

class AskTeacherResponse(BaseModel):
    answer: str
    analogy: Optional[str] = None
    suggested_visual: Optional[Dict[str, Any]] = None
    avatar_emotion: str = "explaining"
    follow_up_question: Optional[str] = None

class AvatarState(BaseModel):
    emotion: str = "explaining"
    is_speaking: bool = False
    viseme: str = "sil"
    gesture: str = "nod"

