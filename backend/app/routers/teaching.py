from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.models.lesson import Lesson, LessonSection, Question, StudentResponse
from app.models.progress import ConceptMastery
from app.schemas.teaching import (
    TeachingStartRequest,
    TeachingResponseRequest,
    TeachingFeedbackResponse,
    ContextualAskRequest,
    ContextualAskResponse,
)
from app.utils.security import get_current_user
from app.agents.misconception_detector import MisconceptionDetector
from app.agents.adaptation_engine import AdaptationEngine
from app.ai.factory import get_llm_provider
from app.avatar.service import AvatarService
from app.rag.retriever import DocumentRetriever
from app.utils.logger import logger

router = APIRouter(prefix="/api/teaching", tags=["Interactive Teaching"])

# In-memory connection manager for WebSockets
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = []
        self.active_connections[session_id].append(websocket)

    def disconnect(self, session_id: str, websocket: WebSocket):
        if session_id in self.active_connections:
            if websocket in self.active_connections[session_id]:
                self.active_connections[session_id].remove(websocket)

    async def broadcast(self, session_id: str, message: Dict[str, Any]):
        if session_id in self.active_connections:
            for connection in self.active_connections[session_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

manager = ConnectionManager()

@router.post("/start")
async def start_teaching_session(
    req: TeachingStartRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lesson = db.query(Lesson).filter(Lesson.id == req.lesson_id, Lesson.user_id == current_user.id).first()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    avatar_svc = AvatarService()
    first_sec = lesson.sections[0] if lesson.sections else None
    cues = await avatar_svc.get_scene_avatar_cues(
        text=first_sec.narration_script if first_sec else "Welcome to your lesson!",
        mood="explaining"
    )

    return {
        "lesson_id": lesson.id,
        "title": lesson.title,
        "current_section_index": lesson.current_section_index,
        "current_mastery": lesson.current_mastery,
        "avatar_cues": cues,
        "status": "active"
    }

@router.post("/respond", response_model=TeachingFeedbackResponse)
async def submit_student_response(
    req: TeachingResponseRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lesson = db.query(Lesson).filter(Lesson.id == req.lesson_id, Lesson.user_id == current_user.id).first()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    question = db.query(Question).filter(Question.id == req.question_id, Question.lesson_id == lesson.id).first()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    detector = MisconceptionDetector()
    eval_result = await detector.evaluate_response(
        question_text=question.question_text,
        expected_concept=question.concept_tested,
        correct_answer=question.correct_answer,
        student_answer=req.student_answer,
        lesson_context=f"Lesson: {lesson.title}, Level: {lesson.target_level}"
    )

    is_correct = eval_result.get("is_correct", False)
    misconception = eval_result.get("detected_misconception")
    explanation = eval_result.get("explanation", "")
    adaptation_action = eval_result.get("adaptation_action", "CONTINUE")
    remedial_analogy = eval_result.get("remedial_analogy")
    new_question_data = eval_result.get("new_question")

    # Dynamic Mastery Calculation
    updated_mastery = AdaptationEngine.calculate_new_mastery(
        current_mastery=lesson.current_mastery,
        is_correct=is_correct,
        confidence=req.confidence,
        response_time_seconds=req.response_time_seconds,
        has_misconception=bool(misconception)
    )
    lesson.current_mastery = updated_mastery

    # Update or insert ConceptMastery
    c_mastery = db.query(ConceptMastery).filter(
        ConceptMastery.user_id == current_user.id,
        ConceptMastery.concept_name == question.concept_tested
    ).first()
    if not c_mastery:
        c_mastery = ConceptMastery(
            user_id=current_user.id,
            subject=lesson.subject,
            concept_name=question.concept_tested,
            mastery_percentage=updated_mastery,
            attempts=1,
            correct_count=1 if is_correct else 0
        )
        db.add(c_mastery)
    else:
        c_mastery.attempts += 1
        if is_correct:
            c_mastery.correct_count += 1
        c_mastery.mastery_percentage = updated_mastery

    # Determine progression
    total_sections = len(lesson.sections)
    is_completed = False
    next_index = lesson.current_section_index

    if is_correct:
        if lesson.sections and 0 <= lesson.current_section_index < len(lesson.sections):
            lesson.sections[lesson.current_section_index].status = "completed"
        if lesson.current_section_index + 1 < total_sections:
            lesson.current_section_index += 1
            next_index = lesson.current_section_index
            lesson.sections[next_index].status = "in_progress"
        else:
            is_completed = True
            lesson.status = "completed"
    else:
        if lesson.sections and 0 <= lesson.current_section_index < len(lesson.sections):
            lesson.sections[lesson.current_section_index].status = "review_needed"

    # Update curriculum summary
    completed_count = sum(1 for sec in lesson.sections if sec.status == "completed")
    curr_summary = dict(lesson.curriculum_summary or {})
    curr_summary["completed_concepts_count"] = completed_count
    lesson.curriculum_summary = curr_summary

    # Persist StudentResponse
    student_resp = StudentResponse(
        lesson_id=lesson.id,
        question_id=question.id,
        user_id=current_user.id,
        student_answer=req.student_answer,
        is_correct=is_correct,
        confidence=req.confidence,
        detected_misconception=misconception,
        ai_feedback=explanation,
        adaptation_action=adaptation_action,
        response_time_seconds=req.response_time_seconds
    )
    db.add(student_resp)
    db.commit()

    # Broadcast event to WebSocket subscribers
    session_key = f"lesson_{lesson.id}"
    await manager.broadcast(session_key, {
        "event": "answer_evaluated",
        "is_correct": is_correct,
        "misconception": misconception,
        "updated_mastery": updated_mastery,
        "adaptation_action": adaptation_action,
        "next_section_index": next_index
    })

    return TeachingFeedbackResponse(
        is_correct=is_correct,
        confidence=eval_result.get("confidence", 0.9),
        detected_misconception=misconception,
        ai_feedback=explanation,
        adaptation_action=adaptation_action,
        remedial_explanation=explanation if not is_correct else None,
        remedial_analogy=remedial_analogy,
        new_question=new_question_data,
        updated_mastery=updated_mastery,
        next_section_index=next_index,
        is_lesson_completed=is_completed
    )

@router.post("/ask", response_model=ContextualAskResponse)
async def ask_teacher_contextual(
    req: ContextualAskRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lesson = db.query(Lesson).filter(Lesson.id == req.lesson_id, Lesson.user_id == current_user.id).first()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    current_sec = None
    if lesson.sections and 0 <= req.current_section_index < len(lesson.sections):
        current_sec = lesson.sections[req.current_section_index]

    sec_title = current_sec.title if current_sec else "Lesson Overview"
    concept = current_sec.concept if current_sec else lesson.subject

    # Retrieve RAG context if lesson is grounded in document
    citation_str = None
    if lesson.document_id:
        retriever = DocumentRetriever(db)
        citations = await retriever.retrieve(
            query=req.student_question,
            user_id=current_user.id,
            document_id=lesson.document_id,
            top_k=2
        )
        if citations:
            citation_str = f"Source: {citations[0].chapter}, Page {citations[0].page}"

    llm = get_llm_provider()
    system_prompt = f"""
You are the AI Teacher in EDUVATAR AI.
You are actively teaching the lesson '{lesson.title}' in the section '{sec_title}'.
Concept: {concept}.
Teaching Style: {lesson.teaching_style}.
Language: {lesson.language}.
Answer the student's question directly, keeping it educational, encouraging, and referencing the active formula or model.
"""
    reply = await llm.generate(prompt=f"Student asks: {req.student_question}", system_prompt=system_prompt)

    return ContextualAskResponse(
        teacher_reply=reply,
        concept_referenced=concept,
        source_citation=citation_str,
        recommended_focus=f"Review the relationship in {concept}"
    )

@router.websocket("/ws/{session_id}")
async def teaching_websocket(websocket: WebSocket, session_id: str):
    await manager.connect(session_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            # Handle live client events (e.g., student started speaking, pause)
            action = data.get("action")
            if action == "ping":
                await websocket.send_json({"event": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(session_id, websocket)
