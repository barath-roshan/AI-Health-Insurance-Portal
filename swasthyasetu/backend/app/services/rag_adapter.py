import os
import logging
from typing import Optional, Dict, Any
import httpx
from dotenv import load_dotenv

load_dotenv()

RAG_SERVICE_URL = os.getenv("RAG_SERVICE_URL", "http://127.0.0.1:5000")
logger = logging.getLogger("rag_adapter")

async def check_rag_health() -> Dict[str, Any]:
    """
    Queries the Node.js health-ai-service RAG health check endpoint.
    """
    url = f"{RAG_SERVICE_URL.rstrip('/')}/health"
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            response = await client.get(url)
            if response.status_code == 200:
                return response.json()
            return {
                "status": "unhealthy",
                "service": "health-ai-service",
                "http_status": response.status_code
            }
        except Exception as e:
            logger.warning(f"RAG microservice health check failed: {e}")
            return {
                "status": "offline",
                "service": "health-ai-service",
                "error": str(e)
            }


async def send_chat_message(
    user_query: str,
    conversation_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Proxies citizen chat query to existing Node.js RAG microservice.
    """
    url = f"{RAG_SERVICE_URL.rstrip('/')}/api/chat"
    payload = {
        "message": user_query.strip(),
    }
    if conversation_id:
        payload["conversationId"] = conversation_id

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(url, json=payload)
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"RAG service returned HTTP {response.status_code}: {response.text}")
                return {
                    "conversationId": conversation_id,
                    "decision": "ERROR",
                    "intent": "UNKNOWN",
                    "answer": f"RAG microservice returned an error (HTTP {response.status_code}). Please try again later.",
                    "error": response.text
                }
        except httpx.ConnectError:
            logger.error("Failed to connect to RAG microservice on port 5000.")
            return {
                "conversationId": conversation_id,
                "decision": "OFFLINE",
                "intent": "UNKNOWN",
                "answer": "The AI Assistant RAG microservice is currently offline. Please ensure Node.js health-ai-service is running on port 5000."
            }
        except Exception as e:
            logger.error(f"RAG adapter execution error: {e}")
            return {
                "conversationId": conversation_id,
                "decision": "ERROR",
                "intent": "UNKNOWN",
                "answer": f"An unexpected error occurred while contacting the AI Assistant: {str(e)}"
            }
