# KAAPAN Chatbot API Reference

## Public Chat Endpoints

### 1. Send Chat Message
- **Endpoint**: `POST /api/chat`
- **Request Body**:
```json
{
  "message": "What are the eligibility rules for PMJAY in Tamil Nadu?",
  "conversation_id": "optional-uuid"
}
```
- **Response**:
```json
{
  "conversationId": "uuid-1234",
  "decision": "ANSWER",
  "intent": "PERSONALIZED_ELIGIBILITY",
  "answer": "Ayushman Bharat PM-JAY eligibility in Tamil Nadu...",
  "sources": [
    {
      "sourceId": "src-ayushman-bharat-pmjay",
      "documentTitle": "AB-PMJAY Official Policy",
      "sectionTitle": "2. Eligibility Criteria",
      "pageNumber": 2,
      "sourceUrl": "https://pmjay.gov.in",
      "verificationStatus": "VERIFIED_OFFICIAL"
    }
  ],
  "handoff": null
}
```

### 2. Session Management
- `POST /api/chat/sessions`: Create new session
- `GET /api/chat/sessions`: List active sessions
- `GET /api/chat/sessions/{conversation_id}`: Retrieve session history
- `DELETE /api/chat/sessions/{conversation_id}`: Clear session

### 3. Source Metadata & Health
- `GET /api/chat/sources/{source_id}`: Retrieve official source provenance
- `GET /api/chat/health`: Service health check
