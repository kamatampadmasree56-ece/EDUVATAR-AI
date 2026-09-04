from typing import List, Dict, Any
from pydantic import BaseModel

class ConceptMasteryItem(BaseModel):
    concept_name: str
    subject: str
    mastery_percentage: float
    attempts: int

class AnalyticsDashboardResponse(BaseModel):
    study_streak_days: int
    total_study_minutes: int
    completed_lessons_count: int
    average_score: float
    strong_concepts: List[str]
    weak_concepts: List[str]
    concept_mastery_list: List[ConceptMasteryItem]
    recent_activity: List[Dict[str, Any]]
    recommended_topics: List[Dict[str, str]]

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
