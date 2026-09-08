import os
import shutil
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.models.document import Document, DocumentChunk
from app.models.lesson import Lesson, LessonSection, Question
from app.schemas.document import DocumentResponse, DocumentDetailResponse, DocumentCitation, DocumentQueryRequest
from app.schemas.lesson import LessonResponse
from app.utils.security import get_current_user
from app.rag.extractors import extract_text_from_file
from app.rag.chunker import create_chunks
from app.ai.factory import get_embedding_provider, get_llm_provider
from app.rag.retriever import DocumentRetriever
from app.config import settings
from app.utils.logger import logger

router = APIRouter(prefix="/api/documents", tags=["Documents & RAG"])

ALLOWED_EXTENSIONS = {"pdf", "doc", "docx", "ppt", "pptx", "txt", "md", "markdown"}
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    subject: str = Form("General Engineering"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    filename = file.filename or "uploaded_file"
    ext = filename.split(".")[-1].lower() if "." in filename else ""

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported format '.{ext}'. Supported formats: PDF, DOC, DOCX, PPT, PPTX, TXT, MD."
        )

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    safe_filename = f"user_{current_user.id}_{filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(file_path)
    if file_size > MAX_FILE_SIZE_BYTES:
        os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of 50MB."
        )

    try:
        # 1. Extract text and metadata
        extracted_sections = extract_text_from_file(file_path, ext)
        total_pages = len(set(s.get("page", 1) for s in extracted_sections)) or 1

        # 2. Chunking
        chunks = create_chunks(extracted_sections)

        # 3. Create document record
        doc_title = filename.rsplit(".", 1)[0].replace("_", " ").replace("-", " ").title()
        doc = Document(
            user_id=current_user.id,
            filename=filename,
            file_type=ext,
            file_size=file_size,
            file_path=file_path,
            title=doc_title,
            subject=subject,
            total_pages=total_pages,
            total_chunks=len(chunks),
            status="processed"
        )
        db.add(doc)
        db.flush()

        # 4. Generate embeddings and store chunks
        embed_provider = get_embedding_provider()
        for c in chunks:
            vec = await embed_provider.embed_text(c["content"])
            chunk_rec = DocumentChunk(
                document_id=doc.id,
                chunk_index=c["chunk_index"],
                page_number=c["page_number"],
                chapter=c["chapter"],
                section_title=c["section_title"],
                content=c["content"],
                metadata_json=c["metadata"],
                embedding_json=vec
            )
            db.add(chunk_rec)

        db.commit()
        db.refresh(doc)
        return DocumentResponse.model_validate(doc)

    except Exception as e:
        logger.error(f"Error processing uploaded document: {e}")
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process document: {str(e)}"
        )


@router.post("/upload-batch", response_model=List[DocumentResponse])
async def upload_batch_documents(
    files: List[UploadFile] = File(...),
    subject: str = Form("General Engineering"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    results = []
    for f in files:
        try:
            res = await upload_document(file=f, subject=subject, current_user=current_user, db=db)
            results.append(res)
        except Exception as err:
            logger.warning(f"Batch upload item skipped ({f.filename}): {err}")
    return results


@router.get("", response_model=List[DocumentResponse])
def get_user_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    docs = db.query(Document).filter(Document.user_id == current_user.id).order_by(Document.created_at.desc()).all()
    return [DocumentResponse.model_validate(d) for d in docs]


@router.get("/{document_id}", response_model=DocumentDetailResponse)
def get_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return DocumentDetailResponse.model_validate(doc)


@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    
    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass

    db.delete(doc)
    db.commit()
    return {"message": "Document deleted successfully"}


@router.post("/query", response_model=List[DocumentCitation])
async def query_rag(
    query_req: DocumentQueryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    retriever = DocumentRetriever(db)
    citations = await retriever.retrieve(
        query=query_req.query,
        user_id=current_user.id,
        document_id=query_req.document_id,
        top_k=query_req.top_k
    )
    return citations


@router.post("/{document_id}/analyze")
async def analyze_document_topic(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Analyze uploaded PDF/document: extract key topic, simple everyday explanation, main points, and terminology."""
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id == doc.id).order_by(DocumentChunk.chunk_index.asc()).limit(6).all()
    combined_text = "\n\n".join([c.content for c in chunks]) if chunks else doc.title

    llm = get_llm_provider()
    prompt = f"""You are an expert engineering educator. Analyze the following uploaded document content and provide an intuitive summary using SIMPLE, RELATABLE TERMINOLOGY and everyday analogies.

Document Title: {doc.title}
Subject: {doc.subject}
Content Excerpt:
{combined_text[:3000]}

Return JSON strictly formatted with these keys:
{{
  "topic": "Concise subject topic name",
  "simple_explanation": "A crystal-clear, intuitive explanation in simple language using a relatable real-world analogy.",
  "main_points": ["Key point 1", "Key point 2", "Key point 3", "Key point 4"],
  "key_terms": [
    {{"term": "Technical Term 1", "simple_meaning": "Everyday plain English explanation"}},
    {{"term": "Technical Term 2", "simple_meaning": "Everyday plain English explanation"}}
  ],
  "core_rules_or_formulas": ["Core rule 1 or formula", "Core rule 2"],
  "recommended_stage": "Basic"
}}
"""
    try:
        raw_res = await llm.generate(prompt=prompt, system_prompt="You simplify complex technical topics into easy-to-understand educational concepts.", response_format="json")
        import json
        clean_json = raw_res.strip()
        if clean_json.startswith("```json"):
            clean_json = clean_json[7:]
        if clean_json.endswith("```"):
            clean_json = clean_json[:-3]
        return json.loads(clean_json.strip())
    except Exception as err:
        logger.warning(f"LLM analysis fallback: {err}")
        return {
            "topic": doc.title,
            "simple_explanation": f"{doc.title} is broken down step-by-step: think of complex engineering systems like water pipes and valves, where each component directs and manages the flow to achieve a precise result.",
            "main_points": [
                f"Core foundations of {doc.title} and why it matters in modern electronics.",
                "Step-by-step design principles and best practices.",
                "Preventing common design bugs, noise, and signal loss.",
                "Real-world application from schematic to physical deployment."
            ],
            "key_terms": [
                {"term": "Signal Integrity", "simple_meaning": "Keeping electrical signals clean without distortion."},
                {"term": "Design Rule Check (DRC)", "simple_meaning": "Automated spell-check for your circuit blueprints."},
                {"term": "Decoupling", "simple_meaning": "Adding tiny power reservoirs to stop voltage drops."}
            ],
            "core_rules_or_formulas": [
                "Keep high-frequency return paths tight to ground planes.",
                "Always verify pinouts and thermal ratings before manufacturing."
            ],
            "recommended_stage": "Basic"
        }


@router.post("/{document_id}/create-lesson", response_model=LessonResponse)
async def create_lesson_from_document(
    document_id: int,
    stage: str = "Basic",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create an interactive lesson in the database directly from an uploaded document."""
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    analysis = await analyze_document_topic(document_id, current_user, db)
    topic_name = analysis.get("topic", doc.title)
    simple_exp = analysis.get("simple_explanation", "")
    points = analysis.get("main_points", [])

    lesson = Lesson(
        user_id=current_user.id,
        title=f"{topic_name} ({stage} Stage)",
        subject=doc.subject or "Engineering",
        learning_objective=f"Understand the core concepts of {topic_name} from your uploaded document.",
        learning_mode="complete_learning",
        target_level=stage,
        duration_minutes=15,
        language="English",
        teaching_style="Friendly Mentor",
        total_sections=3,
        current_section_index=0,
        current_mastery=0.0,
        status="in_progress",
        curriculum_summary={
            "total_concepts": 3,
            "completed_concepts_count": 0,
            "estimated_total_minutes": 15,
            "prerequisites_tree": [f"{topic_name} Foundations -> Advanced Practice"],
            "continuation_plan": f"Master {topic_name} with interactive Socratic quizzes."
        }
    )
    db.add(lesson)
    db.flush()

    # Section 1: Simple Explanation & Analogy
    sec1 = LessonSection(
        lesson_id=lesson.id,
        section_index=0,
        title=f"Core Concept: {topic_name}",
        concept=f"Introduction to {topic_name}",
        explanation_text=simple_exp,
        example_text=f"Key Takeaway: {points[0] if points else 'Focus on the core working principles.'}",
        narration_script=f"Hello! Today we are exploring {topic_name} from your uploaded study material. {simple_exp}",
        visual_type="concept_card",
        visual_data={"points": points[:3]},
        visual_caption=f"{topic_name} Overview & Foundations",
        key_points=points[:4]
    )
    db.add(sec1)
    db.flush()

    q1 = Question(
        lesson_id=lesson.id,
        section_id=sec1.id,
        question_text=f"What is the primary purpose or main mechanism of {topic_name}?",
        question_type="short_answer",
        correct_answer=points[0] if points else "Core working principle",
        explanation="Understanding the primary mechanism is key to applying design rules.",
        concept_tested=f"{topic_name} Core Principle"
    )
    db.add(q1)

    # Section 2: Key Design Rules & Terminology
    sec2 = LessonSection(
        lesson_id=lesson.id,
        section_index=1,
        title=f"Key Rules & Terminology in {topic_name}",
        concept="Best Practices and Key Rules",
        explanation_text="When applying this concept, always follow standard design guidelines to ensure reliability and performance.",
        example_text=points[1] if len(points) > 1 else "Always adhere to standard operating tolerances.",
        narration_script=f"Let's now dive deeper into the key rules and essential terminology of {topic_name}.",
        visual_type="cheat_sheet",
        visual_data={"rules": analysis.get("core_rules_or_formulas", [])},
        visual_caption=f"Essential Design Guidelines for {topic_name}",
        key_points=analysis.get("core_rules_or_formulas", []) or points[1:]
    )
    db.add(sec2)
    db.flush()

    q2 = Question(
        lesson_id=lesson.id,
        section_id=sec2.id,
        question_text=f"Why is it important to follow proper design rules and tolerances in {topic_name}?",
        question_type="short_answer",
        correct_answer="To prevent signal degradation, errors, and system failure.",
        explanation="Design rules maintain operating safety margins and signal integrity.",
        concept_tested="Design Rule Compliance"
    )
    db.add(q2)

    # Section 3: Practical Application & Mastery
    sec3 = LessonSection(
        lesson_id=lesson.id,
        section_index=2,
        title=f"Practical Application & Real-World Mastery",
        concept="Engineering Application",
        explanation_text=f"In professional engineering workflows, {topic_name} is applied to build robust, high-performance systems.",
        example_text=points[2] if len(points) > 2 else "Integrating schematics with physical simulation.",
        narration_script=f"Fantastic work! Now let's see how {topic_name} is implemented in real-world industry designs.",
        visual_type="interactive_chart",
        visual_data={"stage": stage, "topic": topic_name},
        visual_caption=f"Real-World Implementation of {topic_name}",
        key_points=[
            "Verify all schematic connections before layout.",
            "Run automated tests and validation runs.",
            "Document all design decisions for production."
        ]
    )
    db.add(sec3)
    db.flush()

    q3 = Question(
        lesson_id=lesson.id,
        section_id=sec3.id,
        question_text=f"How does mastering {topic_name} help in real-world engineering projects?",
        question_type="short_answer",
        correct_answer="It enables building reliable, optimized, and industry-standard systems.",
        explanation="Practical mastery bridges theoretical math and manufacturable systems.",
        concept_tested="Application Mastery"
    )
    db.add(q3)

    db.commit()
    db.refresh(lesson)
    return LessonResponse.model_validate(lesson)

