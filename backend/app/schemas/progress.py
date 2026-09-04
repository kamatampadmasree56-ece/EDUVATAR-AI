from typing import Optional, List, Dict, Any
from pydantic import BaseModel
import datetime

class ConceptMasteryResponse(BaseModel):
    id: int
    subject: str
    concept_name: str
    mastery_level: float  # 0 to 100%
    confidence_score: float
    total_attempts: int
    correct_attempts: int
    detected_misconceptions: List[str] = []
    last_practiced: datetime.datetime

    class Config:
        from_attributes = True

class LearningPathNode(BaseModel):
    id: str
    title: str
    subject: str
    description: str
    prerequisites: List[str] = []
    difficulty: str  # Beginner, Intermediate, Advanced
    estimated_minutes: int
    mastery_level: float  # 0 to 100%
    is_unlocked: bool
    is_completed: bool

class LearningPathResponse(BaseModel):
    id: int
    subject: str
    title: str
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    current_node_id: Optional[str] = None
    overall_progress: float

    class Config:
        from_attributes = True

class ConceptRadarPoint(BaseModel):
    concept: str
    mastery: float
    subject: str

class StudyAnalyticsResponse(BaseModel):
    streak_days: int
    total_minutes: int
    completed_lessons: int
    average_mastery: float
    strong_concepts: List[str]
    weak_concepts: List[str]
    concept_radar: List[ConceptRadarPoint]
    recent_activity: List[Dict[str, Any]]
