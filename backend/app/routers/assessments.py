import json
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.models.lesson import Lesson, Question
from app.models.assessment import Assessment, AssessmentQuestion
from app.schemas.assessment import (
    AssessmentGenerateRequest,
    AssessmentSubmitRequest,
    AssessmentResponse,
    AssessmentQuestionResponse,
)
from app.utils.security import get_current_user
from app.ai.factory import get_llm_provider
from app.utils.logger import logger

router = APIRouter(prefix="/api/assessments", tags=["Assessments & Report Card"])

# Legacy compatibility router (singular) used by some tests and older clients
legacy_router = APIRouter(prefix="/api/assessment", tags=["Assessments & Report Card"])

@router.post("/generate", response_model=AssessmentResponse)
@router.post("/create", response_model=AssessmentResponse)
async def generate_assessment(
    req: AssessmentGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    subject = req.subject or "Physics"
    title = f"Comprehensive Assessment: {req.topic or 'Electrical Circuits'}"
    
    # Pre-seeded questions for Ohm's Law and general STEM
    questions_data = [
        {
            "question_text": "According to Ohm's Law (V = IR), what is the relationship between Current (I) and Resistance (R) when Voltage is held constant?",
            "question_type": "mcq",
            "options": [
                {"id": "A", "text": "Directly proportional (Current increases as Resistance increases)"},
                {"id": "B", "text": "Inversely proportional (Current decreases as Resistance increases)"},
                {"id": "C", "text": "Current is completely independent of Resistance"},
                {"id": "D", "text": "Exponential growth"}
            ],
            "correct_answer": "B",
            "concept": "Ohm's Law Inverse Relationship",
            "explanation": "Because I = V / R, an increase in resistance decreases the current."
        },
        {
            "question_text": "A standard 12V battery is attached to a 3 Ohm heating resistor. How much current flows through the circuit?",
            "question_type": "mcq",
            "options": [
                {"id": "A", "text": "36 Amperes"},
                {"id": "B", "text": "4 Amperes"},
                {"id": "C", "text": "0.25 Amperes"},
                {"id": "D", "text": "9 Amperes"}
            ],
            "correct_answer": "B",
            "concept": "Current Calculation",
            "explanation": "I = V / R = 12 / 3 = 4 Amperes."
        },
        {
            "question_text": "If you double the Voltage across a fixed resistor, what happens to the electric Current?",
            "question_type": "mcq",
            "options": [
                {"id": "A", "text": "Current halves"},
                {"id": "B", "text": "Current doubles"},
                {"id": "C", "text": "Current stays unchanged"},
                {"id": "D", "text": "Current drops to zero"}
            ],
            "correct_answer": "B",
            "concept": "Voltage Proportionality",
            "explanation": "Current is directly proportional to voltage when resistance is constant."
        }
    ]

    assessment = Assessment(
        user_id=current_user.id,
        lesson_id=req.lesson_id,
        title=title,
        subject=subject,
        total_score=0.0,
        passed=True,
        strong_concepts=[],
        weak_concepts=[],
        misconceptions=[],
        recommended_revision="",
        recommended_next_topic="Series and Parallel Resistor Networks"
    )
    db.add(assessment)
    db.flush()

    for q in questions_data:
        db_q = AssessmentQuestion(
            assessment_id=assessment.id,
            question_text=q["question_text"],
            question_type=q["question_type"],
            options=q["options"],
            correct_answer=q["correct_answer"],
            concept=q["concept"],
            explanation=q["explanation"]
        )
        db.add(db_q)

    db.commit()
    db.refresh(assessment)
    return AssessmentResponse.model_validate(assessment)


# --- Legacy singular endpoints that forward to the plural implementations ---
@legacy_router.post("/generate", response_model=AssessmentResponse)
async def legacy_generate_assessment(
    req: AssessmentGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return await generate_assessment(req, current_user, db)

@router.post("/submit", response_model=AssessmentResponse)
@router.post("/{assessment_id}/submit", response_model=AssessmentResponse)
def submit_assessment(
    req: AssessmentSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    assessment_id: Optional[int] = None
):
    target_id = req.assessment_id or assessment_id
    assessment = db.query(Assessment).filter(Assessment.id == target_id, Assessment.user_id == current_user.id).first()
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")

    q_map = {q.id: q for q in assessment.questions}
    correct_count = 0
    total_count = len(assessment.questions) or 1
    strong = []
    weak = []
    misconceptions = []

    for ans in req.answers:
        q = q_map.get(ans.question_id)
        if q:
            q.student_answer = ans.student_answer
            is_corr = (ans.student_answer.strip().lower() == q.correct_answer.strip().lower())
            q.is_correct = is_corr
            if is_corr:
                correct_count += 1
                strong.append(q.concept)
            else:
                weak.append(q.concept)
                if "inverse" in q.concept.lower():
                    misconceptions.append("Current increases with resistance")

    score_pct = round((correct_count / total_count) * 100.0, 1)
    assessment.total_score = score_pct
    assessment.passed = (score_pct >= 60.0)
    assessment.strong_concepts = list(set(strong)) or ["Voltage Fundamentals"]
    assessment.weak_concepts = list(set(weak))
    assessment.misconceptions = list(set(misconceptions))

    if weak:
        assessment.recommended_revision = f"Revise {', '.join(weak)} and solve 3 additional circuit problems."
    else:
        assessment.recommended_revision = "Excellent mastery! Ready for advanced circuit analysis."

    assessment.recommended_next_topic = "Kirchhoff's Laws & Multi-Loop Circuits"
    
    # Update learner profile counters
    if current_user.profile:
        current_user.profile.completed_lessons_count += 1
        current_user.profile.total_study_minutes += 15

    db.commit()
    db.refresh(assessment)
    return AssessmentResponse.model_validate(assessment)


@legacy_router.post("/submit", response_model=AssessmentResponse)
def legacy_submit_assessment(
    req: AssessmentSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    assessment_id: int | None = None
):
    return submit_assessment(req, current_user, db, assessment_id)

@router.get("/{assessment_id}", response_model=AssessmentResponse)
def get_assessment(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id, Assessment.user_id == current_user.id).first()
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")
    return AssessmentResponse.model_validate(assessment)


@legacy_router.get("/{assessment_id}", response_model=AssessmentResponse)
def legacy_get_assessment(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_assessment(assessment_id, current_user, db)
