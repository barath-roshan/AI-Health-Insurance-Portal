import uuid
from typing import Dict, Any, Optional
from datetime import datetime

class EscalationService:
    """
    Handles human support handoffs and support ticket escalation.
    """
    @staticmethod
    def create_support_ticket(user_query: str, conversation_id: Optional[str] = None, user_id: Optional[str] = None, reason: str = "Human support requested") -> Dict[str, Any]:
        ticket_id = f"supp-{uuid.uuid4().hex[:8]}"
        return {
            "ticket_id": ticket_id,
            "conversation_id": conversation_id,
            "user_id": user_id,
            "user_query": user_query,
            "reason": reason,
            "status": "OPEN",
            "created_at": datetime.utcnow().isoformat(),
            "message": "Your request has been escalated to KAAPAN Health Assistance Team. An agent will review your query shortly."
        }
