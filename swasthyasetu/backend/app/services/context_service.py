from typing import Dict, Any, List, Optional

class ContextService:
    """
    Manages active conversation state, extracted entities, and recent context history.
    """
    def __init__(self):
        self._sessions: Dict[str, Dict[str, Any]] = {}

    def get_or_create_session(self, conversation_id: str) -> Dict[str, Any]:
        if conversation_id not in self._sessions:
            self._sessions[conversation_id] = {
                "conversation_id": conversation_id,
                "active_scheme_id": None,
                "state_or_region": None,
                "jurisdiction": {
                    "country": "India",
                    "state": None,
                    "scope": "NATIONAL"
                },
                "last_intent": None,
                "history": [],
                "pending_clarification": None
            }
        return self._sessions[conversation_id]

    def update_session(
        self,
        conversation_id: str,
        message: str,
        role: str,
        intent: Optional[str] = None,
        scheme_id: Optional[str] = None,
        state: Optional[str] = None
    ):
        session = self.get_or_create_session(conversation_id)
        if scheme_id:
            session["active_scheme_id"] = scheme_id

        if state:
            if session["state_or_region"] != state:
                # User changed state explicitly (e.g. from Tamil Nadu to Kerala)
                session["active_scheme_id"] = None
            session["state_or_region"] = state
            session["jurisdiction"] = {
                "country": "India",
                "state": state,
                "scope": "STATE" if state else "NATIONAL"
            }

        if intent:
            session["last_intent"] = intent

        session["history"].append({"role": role, "content": message})
        if len(session["history"]) > 10:
            session["history"] = session["history"][-10:]

    def clear_session(self, conversation_id: str):
        if conversation_id in self._sessions:
            del self._sessions[conversation_id]
