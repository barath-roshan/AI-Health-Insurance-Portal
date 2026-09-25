from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field

from app.services.rag_adapter import send_chat_message, check_rag_health

router = APIRouter(prefix="/api/chat", tags=["AI Chatbot"])

class ChatRequestSchema(BaseModel):
    message: str = Field(..., min_length=1, description="Citizen input prompt")
    conversation_id: Optional[str] = Field(None, description="Optional existing conversation UUID")

class SourceMetadataSchema(BaseModel):
    schemeName: Optional[str] = None
    sourceUrl: Optional[str] = None
    verificationStatus: Optional[str] = None

class ChatResponseSchema(BaseModel):
    conversationId: Optional[str] = None
    decision: Optional[str] = None
    intent: Optional[str] = None
    answer: str
    sources: Optional[List[SourceMetadataSchema]] = []
    handoff: Optional[Dict[str, Any]] = None

@router.post("", response_model=ChatResponseSchema)
async def chat_with_ai(payload: ChatRequestSchema):
    """
    Integrates citizen chat prompt with Node.js health-ai-service RAG pipeline.
    Reuses Hugging Face E5 embeddings, pgvector retrieval, and Groq LLM generation.
    """
    result = await send_chat_message(
        user_query=payload.message,
        conversation_id=payload.conversation_id
    )
    return result

@router.get("/health")
async def chat_health_check():
    """
    Checks health status of connected Node.js RAG microservice.
    """
    health_data = await check_rag_health()
    return health_data
