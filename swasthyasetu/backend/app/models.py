import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), unique=True, nullable=True)
    full_name = Column(String(255), nullable=True)
    role = Column(String(50), default="USER", index=True)  # USER or ADMIN
    state = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String(50), nullable=True)
    occupation = Column(String(100), nullable=True)
    annual_income = Column(Float, nullable=True)
    family_size = Column(Integer, nullable=True)
    existing_coverage = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scheme_code = Column(String(100), unique=True, nullable=False, index=True)
    scheme_name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=True, index=True)
    state_or_region = Column(String(100), nullable=True, index=True)
    description = Column(Text, nullable=True)
    benefits = Column(JSON, default={})
    status = Column(String(50), default="active", index=True)
    current_version = Column(Integer, default=1)
    source_url = Column(Text, nullable=True)
    verification_status = Column(String(50), default="verified")
    rag_stale = Column(Boolean, default=False)
    last_verified_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    versions = relationship("SchemeVersion", back_populates="scheme", cascade="all, delete-orphan")
    rules = relationship("EligibilityRule", back_populates="scheme", cascade="all, delete-orphan")
    documents = relationship("SchemeDocument", back_populates="scheme", cascade="all, delete-orphan")
    chunks = relationship("SchemeChunk", back_populates="scheme", cascade="all, delete-orphan")


class SchemeVersion(Base):
    __tablename__ = "scheme_versions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scheme_id = Column(String(36), ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False)
    version = Column(Integer, default=1, nullable=False)
    eligibility_rules = Column(JSON, default=[])
    benefits = Column(JSON, default={})
    documents = Column(JSON, default=[])
    application_process = Column(JSON, default={})
    source_url = Column(Text, nullable=True)
    verification_status = Column(String(50), default="verified")
    effective_from = Column(DateTime, default=datetime.utcnow)
    verified_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    scheme = relationship("Scheme", back_populates="versions")


class EligibilityRule(Base):
    __tablename__ = "eligibility_rules"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scheme_id = Column(String(36), ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False, index=True)
    field_name = Column(String(100), nullable=False)
    operator = Column(String(20), nullable=False)  # =, !=, >, >=, <, <=, IN
    expected_value = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    scheme = relationship("Scheme", back_populates="rules")


class SchemeDocument(Base):
    __tablename__ = "scheme_documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scheme_id = Column(String(36), ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False, index=True)
    document_name = Column(String(255), nullable=False)
    mandatory = Column(Boolean, default=True)
    description = Column(Text, nullable=True)

    scheme = relationship("Scheme", back_populates="documents")


class SchemeChunk(Base):
    __tablename__ = "scheme_chunks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scheme_id = Column(String(36), ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False)
    chunk_text = Column(Text, nullable=False)
    embedding = Column(Text, nullable=True)  # JSON representation of 1024-d float vector for fallback / pgvector native
    source_url = Column(Text, nullable=True)
    verification_status = Column(String(50), default="verified")
    created_at = Column(DateTime, default=datetime.utcnow)

    scheme = relationship("Scheme", back_populates="chunks")


class HandoffRequest(Base):
    __tablename__ = "handoff_requests"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=True, index=True)
    conversation_id = Column(String(255), nullable=True)
    user_query = Column(Text, nullable=False)
    intent = Column(String(100), nullable=True)
    reason = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    retrieved_schemes = Column(JSON, default=[])
    status = Column(String(50), default="PENDING", index=True)  # PENDING, IN_PROGRESS, RESOLVED, CLOSED
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    admin_user_id = Column(String(255), nullable=False)
    action = Column(String(100), nullable=False)  # SCHEME_UPDATED, SCHEME_VERSION_CREATED, HANDOFF_STATUS_CHANGED, RAG_REINDEX_REQUIRED
    affected_entity = Column(String(255), nullable=False)
    details = Column(JSON, default={})
    timestamp = Column(DateTime, default=datetime.utcnow)
