import uuid
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field

from app.services.chatbot_service import chatbot_service
from app.rag.pageindex.source_registry import SourceRegistry

router = APIRouter(prefix="/api/chat", tags=["Vectorless AI Chatbot"])
source_registry = SourceRegistry()

class ChatRequestSchema(BaseModel):
    message: str = Field(..., min_length=1, description="Citizen input prompt")
    conversation_id: Optional[str] = Field(None, description="Optional existing conversation UUID")

class JurisdictionSchema(BaseModel):
    country: str = "India"
    state: Optional[str] = None
    scope: str = "NATIONAL"

class SchemeSummarySchema(BaseModel):
    scheme_id: str
    scheme_name: str
    jurisdiction: Optional[str] = "India"
    category: Optional[str] = None
    official_url: Optional[str] = None
    verification_status: Optional[str] = "VERIFIED_OFFICIAL"

class SourceMetadataSchema(BaseModel):
    source_id: Optional[str] = None
    scheme_id: Optional[str] = None
    title: Optional[str] = None
    publisher: Optional[str] = None
    url: Optional[str] = None
    document_type: Optional[str] = "official_guideline"
    jurisdiction: Optional[str] = "India"
    page: Optional[int] = 1
    section: Optional[str] = None
    verification_status: Optional[str] = "VERIFIED_OFFICIAL"
    last_verified: Optional[str] = "2026-09-30"
    # Legacy camelCase aliases
    sourceId: Optional[str] = None
    documentTitle: Optional[str] = None
    sectionTitle: Optional[str] = None
    pageNumber: Optional[int] = 1
    sourceUrl: Optional[str] = None
    verificationStatus: Optional[str] = "VERIFIED_OFFICIAL"

class ChatResponseSchema(BaseModel):
    conversationId: str
    decision: str
    intent: str
    jurisdiction: Optional[JurisdictionSchema] = None
    answer: str
    schemes: List[SchemeSummarySchema] = []
    sources: List[SourceMetadataSchema] = []
    limitations: List[str] = []
    needs_clarification: bool = False
    handoff: Optional[Dict[str, Any]] = None

class SessionCreateSchema(BaseModel):
    title: Optional[str] = "Scheme Assistance"

class SessionResponseSchema(BaseModel):
    id: str
    title: str
    status: str

@router.post("/sessions", response_model=SessionResponseSchema)
async def create_chat_session(payload: SessionCreateSchema):
    session_id = str(uuid.uuid4())
    chatbot_service.context_service.get_or_create_session(session_id)
    return {
        "id": session_id,
        "title": payload.title or "Scheme Assistance",
        "status": "ACTIVE"
    }

@router.get("/sessions")
async def list_chat_sessions():
    sessions = chatbot_service.context_service._sessions
    res = []
    for sid, sdata in sessions.items():
        res.append({
            "id": sid,
            "active_scheme_id": sdata.get("active_scheme_id"),
            "message_count": len(sdata.get("history", []))
        })
    return res

@router.get("/sessions/{conversation_id}")
async def get_chat_session(conversation_id: str):
    session = chatbot_service.context_service._sessions.get(conversation_id)
    if not session:
        raise HTTPException(status_code=404, detail="Conversation session not found")
    return session

@router.delete("/sessions/{conversation_id}")
async def delete_chat_session(conversation_id: str):
    chatbot_service.context_service.clear_session(conversation_id)
    return {"message": "Session deleted successfully", "id": conversation_id}

@router.post("/sessions/{conversation_id}/messages", response_model=ChatResponseSchema)
async def send_session_message(conversation_id: str, payload: ChatRequestSchema):
    result = await chatbot_service.process_chat(
        message=payload.message,
        conversation_id=conversation_id
    )
    return result

@router.post("", response_model=ChatResponseSchema)
async def chat_with_ai(payload: ChatRequestSchema):
    """
    Main Vectorless RAG Chatbot Endpoint using PageIndex + OpenAI.
    """
    result = await chatbot_service.process_chat(
        message=payload.message,
        conversation_id=payload.conversation_id
    )
    return result

@router.get("/sources/{source_id}")
async def get_source_metadata(source_id: str):
    src = source_registry.get_source_by_id(source_id)
    if not src:
        # Fallback metadata for dynamic sources
        return {
            "source_id": source_id,
            "document_title": "Official Government Health Scheme Policy",
            "issuing_authority": "Ministry of Health & Family Welfare",
            "verification_status": "VERIFIED_OFFICIAL",
            "source_url": "https://nhp.gov.in"
        }
    return src

@router.get("/health")
async def chat_health_check():
    return {
        "status": "online",
        "engine": "pageindex-vectorless-rag",
        "llm": chatbot_service.openai_model,
        "openai_configured": bool(chatbot_service.openai_api_key)
    }
