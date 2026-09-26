# KAAPAN Chatbot Final Root-Cause Fix Report

**Project:** KAAPAN — Your Guide to Government Health Benefits  
**Microservice:** `health-ai-service` (Node.js/Express)  
**Frontend Widget:** `frontend/src/components/FloatingChatWidget.jsx`  
**Date:** September 26, 2026  
**Status:** ALL ARCHITECTURAL BUGS RESOLVED & VERIFIED LOCALLY (DO NOT DEPLOY)

---

## 1. Exact Root Cause Analysis

### Root Cause 1: Tamil Nadu Query (`"im from tamilnadu list the schemes available"`) → `OUT_OF_SCOPE`
- **Failure**: The legacy string regex array in `intentClassifier.js` did not contain `"list the schemes available"` and state normalization was absent.
- **Fix**: 
  1. Built `normalizeStateName()` mapping `Tamilnadu`, `Tamil Nadu`, and `TN` to `'Tamil Nadu'`.
  2. Implemented hybrid intent classification with state-based scheme discovery patterns.
  3. Integrated `classifyIntentWithLLM()` using Groq for natural language fallback when queries lack exact regex matches.

### Root Cause 2: Follow-Up Query (`"Tamilnadu, 120000"`) → `OUT_OF_SCOPE`
- **Failure**: `processChat()` passed only `cleanQuery` into `classifyIntent(cleanQuery)` without `conversationHistory` or `conversationState`. Additionally, `getOrCreateConversation()` returned a Supabase object with key `conversation_id` instead of `conversationId`, causing `activeConvId` to evaluate to `undefined` and wiping out in-memory turn state.
- **Fix**:
  1. Fixed property normalization (`conversationId: existing.conversation_id`).
  2. Created `classifyIntentWithContext({ userQuery, conversationHistory, conversationState })` which inherits active intents (`ELIGIBILITY`, `DOCUMENTS`, `APPLICATION`, `SCHEME_DISCOVERY`) for short follow-up messages.

### Root Cause 3: Ordinary Questions & Errors → Customer Care (`HUMAN`) Handoffs
- **Failure**: 
  1. `decisionEngine.js` default unhandled fallback returned `DECISIONS.HUMAN`.
  2. `llmService.js` error catch block returned `requiresHuman: true` and `decision: 'HUMAN'` on Groq infrastructure errors.
- **Fix**:
  1. Updated `decisionEngine.js` default fallback to `DECISIONS.CLARIFY`.
  2. Updated `llmService.js` to synthesize grounded fallback summaries directly from retrieved scheme documents with `requiresHuman: false` on Groq API errors.
  3. Reserved `HUMAN` handoffs strictly for explicit human requests (`HUMAN_REQUEST`), claim disputes (`CLAIM`), and private application status tracking (`STATUS`).

---

## 2. Architecture & Pipeline Changes

### A. Intent Resolution Pipeline
```
User Query + Conversation History + Conversation State
                    ↓
Step 1: Contextual Follow-Up Resolution (inherit activeIntent for short responses)
                    ↓
Step 2: High-Confidence Safety Rules (HUMAN_REQUEST, CLAIM, STATUS)
                    ↓
Step 3: State-Normalized Pattern Classifier (normalizeStateName, plural regexes)
                    ↓
Step 4: LLM Semantic Intent Classifier (Groq JSON classification for ambiguous English)
                    ↓
Step 5: Conservative Domain Gate (High precision OUT_OF_SCOPE filter)
```

### B. General vs Personalized Eligibility
- **General Eligibility Inquiries** (`"What is PM-JAY eligibility?"`, `"Who is eligible for PM-JAY?"`): Classified as general criteria requests. Knowledge base is retrieved and answered directly via RAG (`ANSWER`). Personal state & income are **not** demanded.
- **Personalized Eligibility Inquiries** (`"Am I eligible for PM-JAY?"`, `"Can my family get it?"`): Evaluated via deterministic eligibility rules. Prompt for state & income (`CLARIFY`) only when profile variables are genuinely missing.

---

## 3. Entity Extraction & Normalization
- `normalizeStateName(text)`: Converts `tn`, `tamilnadu`, `kl`, `rj`, `ap`, `mh`, `dl`, etc. to official canonical state names.
- `extractEntities(text)`: Extracts `state`, `income`, `age`, `scheme`, and `relationship` entities from natural English strings.

---

## 4. Vector & Embedding Verification
- **Embedding Model**: `intfloat/multilingual-e5-large` (1024-dimensional feature vector).
- **Prefixes**: `query: ` automatically prepended for search queries; `passage: ` prepended for documents.
- **pgvector Semantics**: Supabase `match_scheme_chunks` RPC uses cosine similarity (`1 - (embedding <=> query)`), returning similarity scores in range `[0.0, 1.0]`.

---

## 5. Evaluation Matrix & Test Results

### A. Official 10-Case Regression Test Suite (`test_regression.js`)
- `TEST_REGRESSION_001`: `"im from tamilnadu list the schemes available"` → `SCHEME_DISCOVERY` | `ANSWER` ✅
- `TEST_REGRESSION_002`: `"What is PM-JAY eligibility?"` → `"Tamilnadu, 120000"` → `ELIGIBILITY` | `ANSWER` ✅
- `TEST_REGRESSION_003`: `"What is PM-JAY eligibility?"` (General Criteria) → `ELIGIBILITY` | `ANSWER` ✅
- `TEST_REGRESSION_004`: `"Am I eligible for PM-JAY?"` (Personalized) → `ELIGIBILITY` | `CLARIFY` ✅
- `TEST_REGRESSION_005`: `"What documents do I need?"` → `DOCUMENTS` | `ANSWER` ✅
- `TEST_REGRESSION_006`: `"I want to talk to a human"` → `HUMAN_REQUEST` | `HUMAN` ✅
- `TEST_REGRESSION_007`: `"My claim was rejected"` → `CLAIM` | `HUMAN` ✅
- `TEST_REGRESSION_008`: `"How do I cook biryani?"` → `OUT_OF_SCOPE` | `OUT_OF_SCOPE` ✅
- `TEST_REGRESSION_009`: `"What benefits does CMCHIS provide?"` → `BENEFITS` | `ANSWER` ✅
- `TEST_REGRESSION_010`: `"How can I apply for PM-JAY?"` → `APPLICATION` | `ANSWER` ✅

**Score:** 10/10 (100% Pass Rate)

### B. 30-Query Customer Care Rate Evaluation (`test_30_queries.js`)
- **ANSWER**: 22 queries (73%)
- **CLARIFY**: 2 queries (7%)
- **HUMAN**: 3 queries (10%) — Strictly reserved for explicit human agent requests, claim rejections, and private card status tracking.
- **OUT_OF_SCOPE**: 3 queries (10%) — Strictly reserved for cooking, coding, and non-health topics.
- **False Customer Care Rate**: **0%** for normal informational citizen queries!

---

## 6. Before vs After Comparison

| Scenario / Query | BEFORE Fix | AFTER Fix |
| :--- | :--- | :--- |
| `"im from tamilnadu list the schemes available"` | `OUT_OF_SCOPE` | `SCHEME_DISCOVERY` → Retrieval → Grounded Answer |
| `"Tamilnadu, 120000"` (Follow-up) | `OUT_OF_SCOPE` | Contextual Follow-Up → `ELIGIBILITY` → State/Income Extracted → Grounded Answer |
| `"What is PM-JAY eligibility?"` | Forced `CLARIFY` state/income prompt | `ELIGIBILITY` (General Criteria) → RAG Retrieval → Grounded Answer |
| Groq API Failure / Offline | `HUMAN` Handoff created | Grounded Fallback Summary → `ANSWER` → NO automatic handoff |
| Unhandled Decision Path | `HUMAN` Handoff created | `CLARIFY` Safe Clarification → NO automatic handoff |
