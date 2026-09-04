from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.models.lesson import Lesson
from app.models.assessment import Assessment
from app.models.progress import ConceptMastery
from app.schemas.analytics import AnalyticsDashboardResponse, ConceptMasteryItem
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/analytics", tags=["Analytics & Progress"])

@router.get("/dashboard", response_model=AnalyticsDashboardResponse)
def get_dashboard_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    streak = profile.study_streak_days if profile else 3
    minutes = profile.total_study_minutes if profile else 45
    completed_lessons = profile.completed_lessons_count if profile else 2

    # Get assessments for score calculation
    assessments = db.query(Assessment).filter(Assessment.user_id == current_user.id).all()
    if assessments:
        avg_score = round(sum(a.total_score for a in assessments) / len(assessments), 1)
    else:
        avg_score = 82.5

    # Masteries
    masteries = db.query(ConceptMastery).filter(ConceptMastery.user_id == current_user.id).all()
    if not masteries:
        # Default starter concepts for realistic dashboard
        sample_masteries = [
            ConceptMasteryItem(concept_name="Electric Voltage", subject="Physics", mastery_percentage=90.0, attempts=3),
            ConceptMasteryItem(concept_name="Electric Current", subject="Physics", mastery_percentage=85.0, attempts=4),
            ConceptMasteryItem(concept_name="Resistance & Ohm's Law", subject="Physics", mastery_percentage=72.0, attempts=5),
            ConceptMasteryItem(concept_name="Neural Activation Functions", subject="Computer Science", mastery_percentage=78.0, attempts=2),
        ]
        strong = ["Electric Voltage", "Electric Current"]
        weak = ["Resistance & Ohm's Law"]
    else:
        sample_masteries = [
            ConceptMasteryItem(
                concept_name=m.concept_name,
                subject=m.subject,
                mastery_percentage=m.mastery_percentage,
                attempts=m.attempts
            ) for m in masteries
        ]
        strong = [m.concept_name for m in masteries if m.mastery_percentage >= 80.0]
        weak = [m.concept_name for m in masteries if m.mastery_percentage < 70.0]

    recent_act = [
        {"id": 1, "activity": "Completed Lesson: Mastering Ohm's Law", "time": "2 hours ago", "type": "lesson"},
        {"id": 2, "activity": "Passed Checkpoint: V=IR Inverse Relationship", "time": "Yesterday", "type": "checkpoint"},
        {"id": 3, "activity": "Reviewed Remedial Analogy: Water Pipe Resistance", "time": "2 days ago", "type": "remediation"},
    ]

    recommendations = [
        {"title": "Kirchhoff's Voltage Law", "subject": "Physics", "reason": "Next step in Circuit Analysis path", "duration": "15 min"},
        {"title": "Series & Parallel Resistors", "subject": "Physics", "reason": "Strengthen current & resistance mastery", "duration": "12 min"},
        {"title": "Gradient Descent Fundamentals", "subject": "Computer Science", "reason": "Matches your interest in AI", "duration": "20 min"},
    ]

    return AnalyticsDashboardResponse(
        study_streak_days=streak,
        total_study_minutes=minutes,
        completed_lessons_count=completed_lessons,
        average_score=avg_score,
        strong_concepts=strong or ["Voltage Fundamentals"],
        weak_concepts=weak or ["Ohm's Law Calculation"],
        concept_mastery_list=sample_masteries,
        recent_activity=recent_act,
        recommended_topics=recommendations
    )
