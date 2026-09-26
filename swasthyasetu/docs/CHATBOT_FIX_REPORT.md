# KAAPAN Chatbot Intelligence Fix Report

**Project:** KAAPAN — Your Guide to Government Health Benefits  
**Service:** `health-ai-service` (Node.js/Express RAG Microservice) & `frontend` (React Floating Widget)  
**Date:** September 26, 2026  
**Status:** ALL FIXES IMPLEMENTED & VERIFIED LOCALLY (DO NOT DEPLOY)

---

## 1. Root Causes

### Root Cause 1: Rigid Intent Classification Pattern Fall-Through
- **Problem**: Queries such as `"im from tamilnadu list the schemes available"` were classified as `OUT_OF_SCOPE`.
- **Cause**: The legacy classifier relied solely on exact regex string matches without state acronym normalization or flexible scheme discovery phrasing.

### Root Cause 2: Stateless Follow-Up Resolution & Conversation ID Key Mismatch
- **Problem**: Natural multi-turn follow-ups such as `"Tamilnadu, 120000"` (answering an eligibility prompt) were evaluated in isolation and misclassified as `OUT_OF_SCOPE`.
- **Cause**: 
  1. Intent classification did not incorporate `conversationHistory` or `conversationState`.
  2. `conversationService.js` returned database rows with key `conversation_id` while `ragPipeline.js` read `conversationId`. This key mismatch caused `activeConvId` to evaluate to `undefined`, resetting in-memory conversation state on every turn.

### Root Cause 3: Over-Aggressive Customer Care Fallback
- **Problem**: Ordinary zero-result vector retrievals or unhandled decision paths triggered `DECISIONS.HUMAN` handoffs.
- **Cause**: `decisionEngine.js` default fallback path returned `DECISIONS.HUMAN` instead of `DECISIONS.CLARIFY`.

### Root Cause 4: Groq Infrastructure Failure Handoff Trigger
- **Problem**: When Groq API returned errors or was offline, the system created human handoffs.
- **Cause**: `llmService.js` fallback returned `requiresHuman: true` and `decision: 'HUMAN'`.

---

## 2. Intent Classifier Before/After

### Before
```javascript
function classifyIntent(userQuery) {
  // Rigid regex string checks on cleanQuery alone
  // Missing acronym mapping (TN, KL, AP, MH)
  // Returns OUT_OF_SCOPE for informal queries
}
```

### After
```javascript
function classifyIntentWithContext(userQuery, conversationHistory = [], conversationState = {}) {
  // Step 1: Hybrid follow-up resolution using activeIntent & conversationState
  // Step 2: High-confidence safety intents (HUMAN_REQUEST, CLAIM, STATUS)
  // Step 3: State-normalized natural language discovery (normalizeStateName)
  // Step 4: Distinction between GENERAL vs PERSONALIZED eligibility
  // Step 5: Entity extraction (state, income, age, scheme, relationship)
}
```

---

## 3. Conversation Context Before/After

### Before
```javascript
// Processed query statelessly
const intent = classifyIntent(cleanQuery);
// conversationId property evaluated to undefined due to key mismatch
```

### After
```javascript
// Active multi-turn memory structure
const conversationState = {
  activeIntent: 'ELIGIBILITY',
  activeScheme: 'PMJAY',
  activeState: 'Tamil Nadu',
  annualIncome: 120000,
  awaiting: ['state', 'annual_income']
};
// Inherits activeIntent for short follow-ups ("Tamilnadu, 120000" -> ELIGIBILITY)
```

---

## 4. Eligibility Handling Before/After

### Before
- Every query containing the string `"eligibility"` (e.g., `"What is PM-JAY eligibility?"`) triggered a mandatory `CLARIFY` prompt requesting citizen state & annual income.

### After
- **General Eligibility** (`"What is PM-JAY eligibility?"`, `"Who is eligible for PM-JAY?"`): Evaluated as general information request. Vector knowledge is retrieved and answered directly via RAG (`ANSWER`).
- **Personalized Eligibility** (`"Am I eligible?"`, `"Can my family get it?"`): Evaluated as personalized request. Checks profile data / asks for state & income if missing (`CLARIFY`).

---

## 5. Retrieval Findings
- `semanticSearch()` in `vectorSearch.js` automatically prepends `"query: "` for search queries and `"passage: "` for documents according to Hugging Face E5 model specifications.
- Implemented query enrichment for short follow-ups: `${activeScheme} ${cleanQuery} ${activeState} health insurance`.

---

## 6. Answerability Findings
- Vector threshold evaluation in `answerability.js` cleanly differentiates:
  - `ANSWERABLE` (Score ≥ 0.70) → `DECISIONS.ANSWER`
  - `UNCERTAIN` (0.50 ≤ Score < 0.70) → `DECISIONS.CLARIFY`
  - `NOT_ANSWERABLE` (Score < 0.50) → `DECISIONS.CLARIFY` (Safe clarification, NOT human handoff).

---

## 7. Groq Findings
- `llmService.js` uses system prompt identity: `"KAAPAN — Your Guide to Government Health Benefits"`.
- On Groq infrastructure failure, `buildGroundedFallbackSummary()` synthesizes a grounded text response directly from retrieved scheme context with `requiresHuman: false`.

---

## 8. Decision Engine Findings
- `decideNextAction()` in `decisionEngine.js` enforces deterministic safety rules:
  - `HUMAN_REQUEST` → `HUMAN`
  - `CLAIM` → `HUMAN`
  - `STATUS` → `HUMAN`
  - `OUT_OF_SCOPE` → `OUT_OF_SCOPE`
  - Default unhandled fallback → `CLARIFY` (Never `HUMAN`).

---

## 9. Entity Extraction
Built `extractEntities(userQuery)` returning:
- `state`: Normalized official state name (`'Tamil Nadu'`)
- `income`: Parsed integer value in INR (`120000`)
- `age`: Parsed integer age (`65`)
- `scheme`: Scheme identifier (`'PMJAY'`, `'CMCHIS'`, `'MEDISEP'`)
- `relationship`: Target beneficiary (`'mother'`, `'father'`, `'family'`)

---

## 10. Error Handling
- **User Needs Human** (`HUMAN_REQUEST`, `CLAIM`, `STATUS`): Creates handoff record in database (`status: pending_assignment`).
- **Infrastructure / API Failure** (Groq, HF Embedding, Database notice): Uses deterministic grounded fallback summaries. No automatic human handoff created.

---

## 11. Regression Tests

Official 10-Case Regression Test Results (`test_regression.js`):

| Test ID | Input Query | Expected Intent | Actual Intent | Expected Decision | Actual Decision | Result |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TEST_REGRESSION_001` | `"im from tamilnadu list the schemes available"` | `SCHEME_DISCOVERY` | `SCHEME_DISCOVERY` | `ANSWER` | `ANSWER` | ✅ PASSED |
| `TEST_REGRESSION_002` | `"Tamilnadu, 120000"` (Follow-up) | `ELIGIBILITY` | `ELIGIBILITY` | `ANSWER` | `ANSWER` | ✅ PASSED |
| `TEST_REGRESSION_003` | `"What is PM-JAY eligibility?"` | `ELIGIBILITY` | `ELIGIBILITY` | `ANSWER` | `ANSWER` | ✅ PASSED |
| `TEST_REGRESSION_004` | `"Am I eligible for PM-JAY?"` | `ELIGIBILITY` | `ELIGIBILITY` | `CLARIFY` | `CLARIFY` | ✅ PASSED |
| `TEST_REGRESSION_005` | `"What documents do I need?"` | `DOCUMENTS` | `DOCUMENTS` | `ANSWER` | `ANSWER` | ✅ PASSED |
| `TEST_REGRESSION_006` | `"I want to talk to a human"` | `HUMAN_REQUEST` | `HUMAN_REQUEST` | `HUMAN` | `HUMAN` | ✅ PASSED |
| `TEST_REGRESSION_007` | `"My claim was rejected"` | `CLAIM` | `CLAIM` | `HUMAN` | `HUMAN` | ✅ PASSED |
| `TEST_REGRESSION_008` | `"How do I cook biryani?"` | `OUT_OF_SCOPE` | `OUT_OF_SCOPE` | `OUT_OF_SCOPE` | `OUT_OF_SCOPE` | ✅ PASSED |
| `TEST_REGRESSION_009` | `"What benefits does CMCHIS provide?"` | `BENEFITS` | `BENEFITS` | `ANSWER` | `ANSWER` | ✅ PASSED |
| `TEST_REGRESSION_010` | `"How can I apply for PM-JAY?"` | `APPLICATION` | `APPLICATION` | `ANSWER` | `ANSWER` | ✅ PASSED |

**Score:** 10/10 (100% Pass Rate)

---

## 12. Playwright Results
- Verified layout and responsive behavior:
  - **Desktop Viewport**: Floating assistant button at `bottom-6 right-6`, floating panel (`w-[420px] h-[620px] shadow-2xl`).
  - **Mobile Viewport**: Full bottom sheet panel (`h-[92vh] inset-x-0 bottom-0`).
  - **State Persistence**: Closing & reopening floating widget preserves messages and conversation ID.

---

## 13. Before vs After Comparison

| Query / Scenario | BEFORE Fix | AFTER Fix |
| :--- | :--- | :--- |
| `"im from tamilnadu list the schemes available"` | `OUT_OF_SCOPE` | `SCHEME_DISCOVERY` → Retrieval → Grounded Answer |
| `"Tamilnadu, 120000"` (Follow-up) | `OUT_OF_SCOPE` | Contextual Follow-Up → `ELIGIBILITY` → State/Income Extracted → Grounded Answer |
| `"What is PM-JAY eligibility?"` | Forced `CLARIFY` state & income prompt | `ELIGIBILITY` → RAG Retrieval → Grounded Criteria Answer |
| Groq API Failure / Offline | `HUMAN` Handoff created | Grounded Fallback Summary → `ANSWER` → NO automatic handoff |
| Unhandled Decision Path | `HUMAN` Handoff created | `CLARIFY` Safe Clarification → NO automatic handoff |
