import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.chatbot_service import chatbot_service
from app.rag.pageindex.retrieval import VectorlessRetrievalEngine

client = TestClient(app)

def test_bug1_tamil_nadu_scheme_discovery():
    engine = VectorlessRetrievalEngine()
    tn_schemes = engine.search_schemes("List schemes for Tamil Nadu", state="Tamil Nadu")
    tn_ids = [s["scheme_id"] for s in tn_schemes]
    
    assert "TN-CMCHIS" in tn_ids
    assert "TN-NK48" in tn_ids
    assert "IN-PMJAY" in tn_ids  # National scheme applicable in TN

def test_bug1_kerala_scheme_discovery_excludes_tn_schemes():
    engine = VectorlessRetrievalEngine()
    kl_schemes = engine.search_schemes("List schemes for Kerala", state="Kerala")
    kl_ids = [s["scheme_id"] for s in kl_schemes]

    # Must contain national schemes applicable in Kerala
    assert "IN-PMJAY" in kl_ids
    # Must NOT contain Tamil Nadu specific schemes!
    assert "TN-CMCHIS" not in kl_ids
    assert "TN-NK48" not in kl_ids

def test_bug1_state_context_preservation_and_switch():
    conv_id = "test-session-state-switch"
    
    # Step 1: User asks for Tamil Nadu
    res1 = client.post("/api/chat", json={"message": "List schemes for Tamil Nadu", "conversation_id": conv_id}).json()
    assert res1["jurisdiction"]["state"] == "Tamil Nadu"
    assert any(s["scheme_id"] == "TN-CMCHIS" for s in res1["schemes"])

    # Step 2: User switches state to Kerala
    res2 = client.post("/api/chat", json={"message": "List schemes for Kerala", "conversation_id": conv_id}).json()
    assert res2["jurisdiction"]["state"] == "Kerala"
    assert not any(s["scheme_id"] == "TN-CMCHIS" for s in res2["schemes"])

    # Step 3: Follow-up question preserves Kerala context
    res3 = client.post("/api/chat", json={"message": "What about the documents required?", "conversation_id": conv_id}).json()
    assert res3["jurisdiction"]["state"] == "Kerala"

def test_bug2_verified_sources_structure():
    response = client.post("/api/chat", json={"message": "Tell me about Ayushman Bharat PMJAY benefits"}).json()
    assert response["decision"] == "ANSWER"
    sources = response["sources"]
    assert len(sources) > 0

    for src in sources:
        assert src["title"] is not None and len(src["title"]) > 0
        assert src["url"] is not None and src["url"].startswith("http")
        assert src["publisher"] is not None
        assert isinstance(src["verification_status"], str) and len(src["verification_status"]) > 0

def test_chat_api_contract_schema():
    response = client.post("/api/chat", json={"message": "List schemes for Tamil Nadu"}).json()
    assert "decision" in response
    assert "intent" in response
    assert "jurisdiction" in response
    assert "schemes" in response
    assert "sources" in response
    assert "needs_clarification" in response
