import os
import shutil
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.models.document import Document, DocumentChunk
from app.schemas.document import DocumentResponse, DocumentDetailResponse, DocumentCitation, DocumentQueryRequest
from app.utils.security import get_current_user
from app.rag.extractors import extract_text_from_file
from app.rag.chunker import create_chunks
from app.ai.factory import get_embedding_provider
from app.rag.retriever import DocumentRetriever
from app.config import settings
from app.utils.logger import logger

router = APIRouter(prefix="/api/documents", tags=["Documents & RAG"])

ALLOWED_EXTENSIONS = {"pdf", "doc", "docx", "ppt", "pptx", "txt", "md", "markdown"}
MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    subject: str = Form("General"),
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

    # Save file locally or in designated upload folder
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
            detail=f"File exceeds maximum allowed size of 25MB."
        )

    try:
        # 1. Extract text and metadata
        extracted_sections = extract_text_from_file(file_path, ext)
        total_pages = len(set(s.get("page", 1) for s in extracted_sections)) or 1

        # 2. Chunking
        chunks = create_chunks(extracted_sections)

        # 3. Create document record
        doc_title = filename.rsplit(".", 1)[0].replace("_", " ").title()
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
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process document: {str(e)}"
        )

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
