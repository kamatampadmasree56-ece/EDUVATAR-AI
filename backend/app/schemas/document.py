from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, AliasChoices
import datetime

class DocumentChunkResponse(BaseModel):
    id: int
    chunk_index: int
    page_number: int
    chapter: str
    section_title: str
    content: str
    metadata: Dict[str, Any] = Field(default_factory=dict, validation_alias=AliasChoices("metadata_json", "metadata"))

    class Config:
        from_attributes = True

class DocumentResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    file_size: int
    title: str
    subject: str
    total_pages: int
    total_chunks: int
    status: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class DocumentDetailResponse(DocumentResponse):
    chunks: List[DocumentChunkResponse] = []

class DocumentQueryRequest(BaseModel):
    query: str
    top_k: int = 4
    document_id: Optional[int] = None

class DocumentCitation(BaseModel):
    document_id: int
    filename: str
    page: int
    chapter: str
    section: str
    chunk_id: int
    snippet: str
    relevance_score: float
