from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.models.document import Document, DocumentChunk
from app.models.lesson import Lesson, LessonSection, Question
from app.schemas.lesson import LessonCreateRequest, LessonResponse, LessonSectionSchema, QuestionSchema
from app.utils.security import get_current_user
from app.agents.lesson_planner import LessonPlanner
from app.rag.retriever import DocumentRetriever
from app.utils.logger import logger

router = APIRouter(prefix="/api/lessons", tags=["Lessons"])

@router.post("/generate", response_model=LessonResponse)
async def generate_lesson(
    req: LessonCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    planner = LessonPlanner()
    rag_context = ""
    target_subject = "General Science"

    # Material Mode with RAG retrieval
    if req.mode == "material" and req.document_id:
        doc = db.query(Document).filter(Document.id == req.document_id, Document.user_id == current_user.id).first()
        if not doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        target_subject = doc.subject
        
        # Retrieve relevant chunks for the chapter or overall doc
        retriever = DocumentRetriever(db)
        search_query = req.chapter or req.topic or doc.title
        citations = await retriever.retrieve(query=search_query, user_id=current_user.id, document_id=doc.id, top_k=5)
        rag_context = "\n\n".join([f"[{c.chapter} - Page {c.page}]: {c.snippet}" for c in citations])
    elif req.topic:
        topic_str = req.topic.lower()
        if "ohm" in topic_str or "physics" in topic_str or "circuit" in topic_str:
            target_subject = "Physics"
        elif "os" in topic_str or "operating system" in topic_str or "neural" in topic_str or "ml" in topic_str or "code" in topic_str:
            target_subject = "Computer Science"
        elif "bio" in topic_str or "dna" in topic_str:
            target_subject = "Biology"
        elif "math" in topic_str or "calculus" in topic_str or "derivative" in topic_str:
            target_subject = "Mathematics"
        elif "chem" in topic_str or "reaction" in topic_str:
            target_subject = "Chemistry"

    # Generate lesson plan JSON with Complete Topic Curriculum Planner
    plan = await planner.create_plan(
        topic=req.topic or (f"Study of {doc.title}" if req.mode == "material" else "Ohm's Law"),
        profile=current_user.profile,
        rag_context=rag_context,
        duration_minutes=req.duration_minutes,
        target_level=req.target_level,
        language=req.language,
        learning_mode=req.learning_mode
    )

    # Persist Lesson record
    lesson = Lesson(
        user_id=current_user.id,
        document_id=req.document_id if req.mode == "material" else None,
        title=plan.get("title", req.topic or "Interactive AI Lesson"),
        subject=plan.get("subject", target_subject),
        learning_objective=plan.get("learning_objective", "Master core concept foundations"),
        learning_mode=req.learning_mode,
        target_level=req.target_level,
        duration_minutes=req.duration_minutes,
        language=req.language,
        teaching_style=req.teaching_style,
        total_sections=len(plan.get("sections", [])),
        current_section_index=0,
        current_mastery=50.0,
        status="in_progress",
        curriculum_summary=plan.get("curriculum_summary", {})
    )
    db.add(lesson)
    db.flush()

    # Persist Sections & Questions
    for sec_data in plan.get("sections", []):
        sec = LessonSection(
            lesson_id=lesson.id,
            section_index=sec_data.get("section_index", 0),
            title=sec_data.get("title", "Section"),
            concept=sec_data.get("concept", "Concept"),
            explanation_text=sec_data.get("explanation_text", ""),
            example_text=sec_data.get("example_text", ""),
            analogy_text=sec_data.get("analogy_text", ""),
            prerequisites=sec_data.get("prerequisites", []),
            importance=sec_data.get("importance", "high"),
            status=sec_data.get("status", "not_started"),
            scenes=sec_data.get("scenes", []),
            visual_type=sec_data.get("visual_type", "katex"),
            visual_data=sec_data.get("visual_data", {}),
            visual_caption=sec_data.get("visual_caption", ""),
            key_points=sec_data.get("key_points", []),
            narration_script=sec_data.get("narration_script", ""),
            estimated_minutes=sec_data.get("estimated_minutes", 3)
        )
        db.add(sec)
        db.flush()

        for q_data in sec_data.get("questions", []):
            q = Question(
                lesson_id=lesson.id,
                section_id=sec.id,
                question_type=q_data.get("question_type", "mcq"),
                question_text=q_data.get("question_text", ""),
                options=q_data.get("options", []),
                correct_answer=q_data.get("correct_answer", ""),
                explanation=q_data.get("explanation", ""),
                difficulty=q_data.get("difficulty", "medium"),
                concept_tested=q_data.get("concept_tested", sec.concept)
            )
            db.add(q)

    db.commit()
    db.refresh(lesson)
    return LessonResponse.model_validate(lesson)

@router.get("", response_model=List[LessonResponse])
def get_user_lessons(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lessons = db.query(Lesson).filter(Lesson.user_id == current_user.id).order_by(Lesson.created_at.desc()).all()
    return [LessonResponse.model_validate(l) for l in lessons]

@router.get("/{lesson_id}", response_model=LessonResponse)
def get_lesson_by_id(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id, Lesson.user_id == current_user.id).first()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")
    return LessonResponse.model_validate(lesson)

@router.post("/{lesson_id}/select-concept/{section_index}", response_model=LessonResponse)
def select_concept(
    lesson_id: int,
    section_index: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id, Lesson.user_id == current_user.id).first()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")
    
    if section_index < 0 or section_index >= len(lesson.sections):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid section index")
    
    lesson.current_section_index = section_index
    if lesson.sections[section_index].status == "not_started":
        lesson.sections[section_index].status = "in_progress"
        
    db.commit()
    db.refresh(lesson)
    return LessonResponse.model_validate(lesson)

@router.post("/{lesson_id}/resume", response_model=LessonResponse)
def resume_lesson(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id, Lesson.user_id == current_user.id).first()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")
    
    # Resume from first unfinished concept
    next_idx = 0
    for idx, sec in enumerate(lesson.sections):
        if sec.status in ["not_started", "in_progress", "review_needed"]:
            next_idx = idx
            break
            
    lesson.current_section_index = next_idx
    lesson.sections[next_idx].status = "in_progress"
    db.commit()
    db.refresh(lesson)
    return LessonResponse.model_validate(lesson)
