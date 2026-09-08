from typing import List, Dict, Any
from pydantic import BaseModel

class ConceptMasteryItem(BaseModel):
    concept_name: str
    subject: str
    mastery_percentage: float
    attempts: int

class AnalyticsDashboardResponse(BaseModel):
    # Fields aligned with the frontend StudyAnalytics type
    streak_days: int
    total_minutes: int
    completed_lessons: int
    average_mastery: float
    strong_concepts: List[str]
    weak_concepts: List[str]
    concept_radar: List[Dict[str, Any]]
    recent_activity: List[Dict[str, Any]]
    # Extended backend-only fields
    concept_mastery_list: List[ConceptMasteryItem] = []
    recommended_topics: List[Dict[str, str]] = []

class LearningPathNode(BaseModel):
    id: str
    title: str
    description: str
    status: str  # completed, active, locked
    mastery: float
    prerequisites: List[str] = []

class LearningPathResponse(BaseModel):
    id: int
    title: str
    subject: str
    overall_progress: float
    current_node_id: str
    nodes: List[LearningPathNode]
