# SwasthyaSetu — Government Health Insurance Eligibility & Assistance Copilot

**Standalone RAG AI Microservice**

An independent Node.js / Express microservice providing reliable, evidence-gated semantic retrieval, answerability evaluation, clarification steering, and human handoff for government health insurance schemes in India using MongoDB Atlas Vector Search, Hugging Face Inference API (`intfloat/multilingual-e5-large`), and Groq LLM API.

---

> **IMPORTANT DISCLAIMER**  
> **"This dataset is a seed metadata corpus. Eligibility information must be verified against current official government sources before production use."**

---

## 🏛️ 1. Complete RAG Architecture Overview

This standalone microservice implements a transparent, multi-stage RAG pipeline without heavy external agent frameworks or Python dependencies.

```
                                USER
                                 │
                                 ▼
                           POST /api/chat
                                 │
                                 ▼
                 Intent Classifier (intentClassifier)
                                 │
                                 ▼
      Hugging Face E5 Query Embedding ("query: " + userQuery)
                                 │
                                 ▼
          MongoDB Atlas Vector Search (scheme_knowledge)
                                 │
                                 ▼
             Answerability Engine (evaluateAnswerability)
                                 │
                                 ▼
               Decision Engine (decideNextAction)
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
           ANSWER             CLARIFY             HUMAN
              │                  │                  │
              ▼                  ▼                  ▼
          Groq LLM              User           Handoff Service
    (llama-3.3-70b-versatile)   Prompt      (handoff_requests DB)
              │
              ▼
       Grounded Response
```

### Architectural Responsibilities Scoping
- **Hugging Face E5 (`intfloat/multilingual-e5-large`)**: Generates 1024-dimensional vector embeddings with strict prefix conventions (`"passage: "` for documents, `"query: "` for queries).
- **MongoDB Atlas Vector Search**: Knowledge storage and vector similarity search.
- **Intent Classifier**: Classifies queries into 10 categories without unnecessary LLM calls.
- **Answerability Engine**: Evaluates whether retrieved evidence score & content are sufficient.
- **Decision Engine**: Enforces deterministic routing rules (`ANSWER`, `CLARIFY`, `HUMAN`, `OUT_OF_SCOPE`).
- **Groq LLM**: Generates natural language responses strictly grounded in retrieved evidence.
- **Human Handoff Service**: Persists rich support context in `handoff_requests` collection when cases require human intervention.

---

## 📊 2. Database Collections

### 1. `scheme_knowledge`
Stores 130 government health scheme records, `searchableTextHash`, and 1024-dimensional vector embeddings.

### 2. `conversations`
Stores chat history per session for multi-turn conversational context windowing.
```json
{
  "conversationId": "conv_a1b2c3d4",
  "messages": [
    { "role": "user", "content": "What is CMCHIS?", "timestamp": "2026-09-25T23:00:00.000Z" },
    { "role": "assistant", "content": "CMCHIS is...", "timestamp": "2026-09-25T23:00:02.000Z" }
  ],
  "createdAt": "2026-09-25T23:00:00.000Z",
  "updatedAt": "2026-09-25T23:00:02.000Z"
}
```

### 3. `handoff_requests`
Stores structured handoff tickets for human customer care support.
```json
{
  "_id": "67954a1b...",
  "conversationId": "conv_a1b2c3d4",
  "userQuery": "My CMCHIS claim was rejected by the hospital.",
  "intent": "CLAIM",
  "reason": "Case-specific claim dispute or hospital rejection requires human customer care intervention.",
  "summary": "User reports that a CMCHIS claim was rejected by a hospital.",
  "retrievedSchemes": [{ "schemeId": "cmchis", "schemeName": "CMCHIS" }],
  "status": "PENDING",
  "createdAt": "2026-09-25T23:00:00.000Z",
  "updatedAt": "2026-09-25T23:00:00.000Z"
}
```

---

## 🔌 3. REST API Documentation

### `POST /api/chat`

Main conversational entry point.

#### Request Body:
```json
{
  "conversationId": "conv_optional_id",
  "message": "What government health insurance is available in Tamil Nadu?"
}
```

#### Response Types:

1. **`ANSWER` Decision**:
   ```json
   {
     "conversationId": "conv_12345",
     "decision": "ANSWER",
     "intent": "SCHEME_DISCOVERY",
     "answer": "The Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS) is available in Tamil Nadu providing cashless coverage up to ₹5 lakh per year for low-income families.",
     "sources": [
       {
         "schemeName": "Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS)",
         "sourceUrl": "",
         "verificationStatus": "needs_verification"
       }
     ]
   }
   ```

2. **`CLARIFY` Decision**:
   ```json
   {
     "conversationId": "conv_12345",
     "decision": "CLARIFY",
     "intent": "ELIGIBILITY",
     "answer": "To check your eligibility, could you please specify your state of residence and approximate annual household income?"
   }
   ```

3. **`HUMAN` Decision**:
   ```json
   {
     "conversationId": "conv_12345",
     "decision": "HUMAN",
     "intent": "CLAIM",
     "answer": "This request requires case-specific support or official system verification. I have prepared your conversation context for our customer care team.",
     "handoff": {
       "status": "PENDING",
       "reason": "Case-specific claim dispute or hospital rejection requires human customer care intervention."
     }
   }
   ```

4. **`OUT_OF_SCOPE` Decision**:
   ```json
   {
     "conversationId": "conv_12345",
     "decision": "OUT_OF_SCOPE",
     "intent": "OUT_OF_SCOPE",
     "answer": "I am specialized in Indian government health insurance schemes, eligibility, coverage benefits, documents, and application procedures. How can I help you with government health schemes today?"
   }
   ```

---

## 🛠️ 4. Commands Workflow

```bash
# 1. Import scheme records from CSV into MongoDB
npm run import:schemes

# 2. Test Hugging Face embedding generation & verify vector dimensions
npm run test:embedding

# 3. Generate batch document embeddings via DeepInfra
npm run embeddings

# 4. Display/Create MongoDB Atlas Vector Search index definition
npm run create:index

# 5. Run Semantic Search evaluation suite
npm run test:retrieval

# 6. Run RAG Chatbot test suite across 10 decision scenarios
npm run test:chat

# 7. Start Express server
npm run dev
```

---

## ⚙️ 5. Environment Variables

Create `.env` based on `.env.example`:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=health_ai_service

HF_TOKEN=your_huggingface_token
HF_PROVIDER=deepinfra
HF_EMBEDDING_MODEL=intfloat/multilingual-e5-large
EMBEDDING_DIMENSIONS=1024

GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

PORT=5000

RETRIEVAL_RELEVANT_THRESHOLD=0.70
RETRIEVAL_UNCERTAIN_THRESHOLD=0.50
```

---

## 🚫 6. Intentionally NOT Implemented Yet

As per current architecture design:
- ❌ Deterministic Eligibility Rules Engine (future phase)
- ❌ Voice / Speech-to-Text (STT) / Audio processing
- ❌ Twilio / WhatsApp / SMS integration
- ❌ Customer care live portal UI
