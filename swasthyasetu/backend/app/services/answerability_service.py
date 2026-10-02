from typing import Dict, Any, List

class AnswerabilityService:
    """
    Evaluates evidence grounding and determines answer decision:
    ANSWER, CLARIFY, SAFE_NO_ANSWER, or HUMAN.
    """
    @staticmethod
    def evaluate(query: str, evidence: List[Dict[str, Any]], intent: str) -> Dict[str, Any]:
        if intent == "HUMAN_REQUEST":
            return {"decision": "HUMAN", "reason": "User explicitly requested human support agent."}

        if not evidence:
            if any(term in query.lower() for term in ["hello", "hi", "hey", "who are you", "what is kaapan"]):
                return {"decision": "ANSWER", "reason": "General greeting/identity question."}
            return {
                "decision": "SAFE_NO_ANSWER",
                "reason": "No verified official scheme documents found supporting this request."
            }

        # Check if user query is vague and needs clarification
        if len(query.split()) < 3 and not any(k in query.lower() for k in ["pmjay", "cghs", "esis", "tn"]):
            return {
                "decision": "CLARIFY",
                "reason": "Query is ambiguous. Clarification required."
            }

        return {"decision": "ANSWER", "reason": "Retrieved evidence directly supports the query."}
