import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    filename = Column(String(255), nullable=False)
    file_type = Column(String(20), nullable=False)  # pdf, docx, pptx, txt, md
    file_size = Column(Integer, default=0)
    file_path = Column(String(500), nullable=False)
    title = Column(String(255), default="Uploaded Document")
    subject = Column(String(100), default="General")
    total_pages = Column(Integer, default=1)
    total_chunks = Column(Integer, default=0)
    status = Column(String(50), default="processed")  # uploaded, processing, processed, error
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False, index=True)
    
    chunk_index = Column(Integer, nullable=False)
    page_number = Column(Integer, default=1)
    chapter = Column(String(100), default="General")
    section_title = Column(String(255), default="")
    content = Column(Text, nullable=False)
    
    # Metadata & vector representation
    metadata_json = Column(JSON, default=dict)
    embedding_json = Column(JSON, nullable=True)  # float array for local fallback vector search
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    document = relationship("Document", back_populates="chunks")
