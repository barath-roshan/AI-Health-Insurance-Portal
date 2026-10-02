import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.rag.pageindex.retrieval import VectorlessRetrievalEngine
from app.services.chatbot_service import chatbot_service
from app.services.answerability_service import AnswerabilityService

client = TestClient(app)

def test_pageindex_retrieval_engine():
    engine = VectorlessRetrievalEngine()
    res = engine.retrieve_evidence("Ayushman Bharat PMJAY eligibility")
    assert "evidence" in res
    assert res["evidence_count"] >= 0

def test_intent_classification():
    assert chatbot_service.classify_intent("Am I eligible for PMJAY?") == "PERSONALIZED_ELIGIBILITY"
    assert chatbot_service.classify_intent("I want to speak with a human agent") == "HUMAN_REQUEST"
    assert chatbot_service.classify_intent("What documents are required?") == "DOCUMENTS"

def test_answerability_evaluation():
    eval_res = AnswerabilityService.evaluate(
        "tell me about pmjay",
        [{"document_title": "PMJAY Guidelines", "quoted_text": "Sample coverage text"}],
        "SCHEME_DISCOVERY"
    )
    assert eval_res["decision"] == "ANSWER"

def test_chat_api_endpoint():
    response = client.post("/api/chat", json={"message": "What is Ayushman Bharat PMJAY?"})
    assert response.status_code == 200
    data = response.json()
    assert "conversationId" in data
    assert "answer" in data
    assert "decision" in data

def test_chat_health_endpoint():
    response = client.get("/api/chat/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["engine"] == "pageindex-vectorless-rag"
