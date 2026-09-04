from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.document import Document, DocumentChunk
from app.ai.factory import get_embedding_provider
from app.rag.vector_store import VectorStore
from app.schemas.document import DocumentCitation

class DocumentRetriever:
    def __init__(self, db: Session):
        self.db = db
        self.embedding_provider = get_embedding_provider()

    async def retrieve(
        self,
        query: str,
        user_id: int,
        document_id: Optional[int] = None,
        top_k: int = 4
    ) -> List[DocumentCitation]:
        # Query matching chunks for the user
        chunk_query = self.db.query(DocumentChunk).join(Document).filter(Document.user_id == user_id)
        if document_id:
            chunk_query = chunk_query.filter(DocumentChunk.document_id == document_id)

        db_chunks = chunk_query.all()
        if not db_chunks:
            return []

        # Embed user query
        query_vec = await self.embedding_provider.embed_text(query)

        chunk_dicts = []
        for chk in db_chunks:
            chunk_dicts.append({
                "id": chk.id,
                "document_id": chk.document_id,
                "filename": chk.document.filename if chk.document else "Document",
                "page": chk.page_number,
                "chapter": chk.chapter or "General",
                "section": chk.section_title or f"Page {chk.page_number}",
                "content": chk.content,
                "embedding": chk.embedding_json or []
            })

        ranked = VectorStore.search(query_vec, chunk_dicts, top_k=top_k)

        citations: List[DocumentCitation] = []
        for item, score in ranked:
            citations.append(DocumentCitation(
                document_id=item["document_id"],
                filename=item["filename"],
                page=item["page"],
                chapter=item["chapter"],
                section=item["section"],
                chunk_id=item["id"],
                snippet=item["content"][:300] + ("..." if len(item["content"]) > 300 else ""),
                relevance_score=round(score, 3)
            ))

        return citations

    def format_citations_header(self, citations: List[DocumentCitation]) -> str:
        if not citations:
            return "I couldn't find this in your uploaded material. I can explain it using general knowledge if you'd like."
        
        top = citations[0]
        return f"Source: {top.chapter}, Page {top.page} (File: {top.filename})"
