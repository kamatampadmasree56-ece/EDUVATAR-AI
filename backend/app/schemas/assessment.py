from typing import Optional, List, Dict, Any
from pydantic import BaseModel
import datetime

class AssessmentQuestionSubmit(BaseModel):
    question_id: int
    student_answer: str

class AssessmentSubmitRequest(BaseModel):
    assessment_id: int
    answers: List[AssessmentQuestionSubmit]

class AssessmentQuestionResponse(BaseModel):
    id: int
    question_text: str
    question_type: str
    options: List[Dict[str, Any]]
    concept: str

    class Config:
        from_attributes = True

class AssessmentGenerateRequest(BaseModel):
    lesson_id: Optional[int] = None
    subject: Optional[str] = "Physics"
    topic: Optional[str] = "Electricity"

class AssessmentResponse(BaseModel):
    id: int
    lesson_id: Optional[int] = None
    title: str
    subject: str
    total_score: float
    passed: bool
    strong_concepts: List[str] = []
    weak_concepts: List[str] = []
    misconceptions: List[str] = []
    recommended_revision: str
    recommended_next_topic: str
    questions: List[AssessmentQuestionResponse] = []
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class AssessmentCreateRequest(BaseModel):
    lesson_id: Optional[int] = None
    title: Optional[str] = "Comprehensive Mastery Check"
    subject: Optional[str] = "Physics"

class AssessmentDetailResponse(BaseModel):
    id: int
    user_id: int
    lesson_id: Optional[int] = None
    title: str
    subject: str
    total_score: float = 0.0
    passed: bool = True
    strong_concepts: List[str] = []
    weak_concepts: List[str] = []
    misconceptions: List[str] = []
    recommended_revision: Optional[str] = ""
    recommended_next_topic: Optional[str] = ""
    questions: List[AssessmentQuestionResponse] = []
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class AssessmentSubmissionRequest(BaseModel):
    answers: List[AssessmentQuestionSubmit]

class ConceptReviewItem(BaseModel):
    concept: str
    status: str  # mastered, review_needed
    feedback: str
    remedial_tip: Optional[str] = None

class ReportCardResponse(BaseModel):
    assessment_id: int
    score_percentage: float
    total_score: float
    max_score: float
    passed: bool
    grade: str
    teacher_summary: str
    mastered_concepts: List[str] = []
    detected_misconceptions: List[Dict[str, Any]] = []
    concept_reviews: List[ConceptReviewItem] = []
    next_recommended_topic: str = ""
    next_recommended_lesson_id: Optional[int] = None

