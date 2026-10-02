import os
import json
import logging
import uuid
from typing import Dict, Any, Optional, List
import httpx

from app.rag.pageindex.retrieval import VectorlessRetrievalEngine, STATE_ALIAS_MAP
from app.services.context_service import ContextService
from app.services.answerability_service import AnswerabilityService
from app.services.citation_service import CitationService
from app.services.escalation_service import EscalationService

logger = logging.getLogger("chatbot_service")

class VectorlessChatbotService:
    """
    Production-Ready Vectorless RAG Chatbot Service powered by PageIndex and OpenAI.
    "AI assists. Verified evidence informs. Deterministic rules decide eligibility."
    """
    def __init__(self):
        self.retrieval_engine = VectorlessRetrievalEngine()
        self.context_service = ContextService()
        self.openai_api_key = os.getenv("OPENAI_API_KEY", "")
        self.openai_model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    def classify_intent(self, query: str) -> str:
        res = self.classify_intent_and_jurisdiction(query, {})
        return res["intent"]

    def classify_intent_and_jurisdiction(self, query: str, session: Dict[str, Any]) -> Dict[str, Any]:
        q = query.lower()
        intent = "SCHEME_DISCOVERY"
        if any(term in q for term in ["human", "agent", "support", "person", "representative"]):
            intent = "HUMAN_REQUEST"
        elif any(term in q for term in ["eligible", "can i get", "qualify", "am i eligible"]):
            intent = "PERSONALIZED_ELIGIBILITY"
        elif any(term in q for term in ["document", "proof", "aadhaar", "certificate"]):
            intent = "DOCUMENTS"
        elif any(term in q for term in ["apply", "application", "portal", "register"]):
            intent = "APPLICATION"
        elif any(term in q for term in ["benefit", "coverage", "lakh", "amount", "hospital"]):
            intent = "BENEFITS"

        # Detect state from query
        detected_state = VectorlessRetrievalEngine.normalize_state(query)
        if detected_state:
            active_state = detected_state
            scope = "STATE"
        else:
            # Preserve state from previous session context for follow-up questions
            active_state = session.get("state_or_region")
            scope = "STATE" if active_state else "NATIONAL"

        jurisdiction = {
            "country": "India",
            "state": active_state,
            "scope": scope
        }

        return {
            "intent": intent,
            "jurisdiction": jurisdiction,
            "state": active_state
        }

    async def generate_openai_response(self, query: str, context: List[Dict[str, str]], evidence: List[Dict[str, Any]], intent: str, jurisdiction: Dict[str, Any]) -> str:
        state_name = jurisdiction.get("state") or "India"
        if not self.openai_api_key:
            if evidence:
                top_items = [f"• {e.get('document_title')}: {e.get('quoted_text')}" for e in evidence[:3]]
                return f"Schemes for {state_name}:\n\n" + "\n\n".join(top_items)
            return f"No verified health schemes found matching '{state_name}'."

        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.openai_api_key}",
            "Content-Type": "application/json"
        }

        system_prompt = (
            f"You are KAAPAN, an AI assistant for Indian government health scheme discovery.\n"
            f"Jurisdiction Context: {state_name}\n"
            "PRINCIPLE: AI assists. Verified evidence informs. Deterministic rules decide eligibility.\n"
            "STRICT RULES:\n"
            "1. Answer using ONLY the provided verified document evidence bundle.\n"
            "2. Do NOT invent schemes from other states or fake URL links.\n"
            "3. Format listed schemes clearly with bullet points.\n"
        )

        evidence_str = "\n---\n".join([
            f"Document: {e.get('document_title')} (Publisher: {e.get('publisher')})\nContent: {e.get('quoted_text')}"
            for e in evidence
        ])

        messages = [{"role": "system", "content": system_prompt}]
        for c in context[-4:]:
            messages.append(c)

        messages.append({
            "role": "user",
            "content": f"Query: {query}\n\nRetrieved Evidence for {state_name}:\n{evidence_str}"
        })

        payload = {
            "model": self.openai_model,
            "messages": messages,
            "temperature": 0.2,
            "max_tokens": 500
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                res = await client.post(url, json=payload, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    return data["choices"][0]["message"]["content"].strip()
                return f"Official schemes available in {state_name}:\n\n" + "\n".join([f"• {e.get('document_title')}" for e in evidence])
            except Exception as e:
                logger.error(f"OpenAI connection error: {e}")
                return f"Official schemes available in {state_name}:\n\n" + "\n".join([f"• {e.get('document_title')}" for e in evidence])

    async def process_chat(self, message: str, conversation_id: Optional[str] = None, user_profile: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        conv_id = conversation_id or str(uuid.uuid4())
        session = self.context_service.get_or_create_session(conv_id)
        
        parsed_context = self.classify_intent_and_jurisdiction(message, session)
        intent = parsed_context["intent"]
        jurisdiction = parsed_context["jurisdiction"]
        target_state = parsed_context["state"]

        # Update session with newly detected state
        self.context_service.update_session(conv_id, message, "user", intent=intent, state=target_state)

        # Pre-filter schemes by jurisdiction
        matching_schemes = self.retrieval_engine.search_schemes(message, state=target_state, max_results=10)

        # Retrieve PageIndex section evidence
        retrieval_res = self.retrieval_engine.retrieve_evidence(
            query=message,
            scheme_id=session.get("active_scheme_id"),
            state=target_state
        )
        evidence = retrieval_res.get("evidence", [])
        matched_scheme_id = retrieval_res.get("scheme_id")

        if matched_scheme_id:
            session["active_scheme_id"] = matched_scheme_id

        # Format scheme summary items for API response
        formatted_schemes = []
        for s in matching_schemes:
            formatted_schemes.append({
                "scheme_id": s.get("scheme_id"),
                "scheme_name": s.get("scheme_name"),
                "jurisdiction": s.get("jurisdiction") or s.get("state_or_region"),
                "category": s.get("category"),
                "official_url": s.get("official_url") or s.get("source_url"),
                "verification_status": s.get("verification_status", "VERIFIED_OFFICIAL")
            })

        # Answerability check
        if not matching_schemes and not evidence:
            decision = "SAFE_NO_ANSWER"
            answer = f"No verified health schemes found for {target_state or 'the requested query'} in our catalogue. Please check official government portals or request human support."
            sources = []
            handoff = None
        else:
            answerability = AnswerabilityService.evaluate(message, evidence, intent)
            decision = answerability["decision"]
            handoff = None

            if decision == "HUMAN":
                ticket = EscalationService.create_support_ticket(message, conversation_id=conv_id)
                answer = "I have created a human support ticket for you. An agent will assist you shortly."
                handoff = ticket
            elif decision == "SAFE_NO_ANSWER":
                answer = f"No verified health scheme documents were found for {target_state or 'the requested location'}."
                sources = []
            elif decision == "CLARIFY":
                answer = "Could you please specify which state or scheme you are interested in? (e.g. Tamil Nadu, Kerala, PM-JAY)"
                sources = []
            else:
                answer = await self.generate_openai_response(message, session["history"], evidence, intent, jurisdiction)
                sources = CitationService.format_citations(evidence)

        # Update assistant response history
        self.context_service.update_session(conv_id, answer, "assistant")

        return {
            "conversationId": conv_id,
            "decision": decision,
            "intent": intent,
            "jurisdiction": jurisdiction,
            "answer": answer,
            "schemes": formatted_schemes,
            "sources": sources,
            "limitations": [],
            "needs_clarification": decision == "CLARIFY",
            "handoff": handoff
        }

chatbot_service = VectorlessChatbotService()
