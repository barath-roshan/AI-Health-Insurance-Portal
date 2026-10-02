# OpenAI Integration Specification

## Overview
OpenAI API generates evidence-grounded answers for citizen queries using evidence bundles provided by the PageIndex Vectorless Retrieval Engine.

## Configuration Environment Variables
```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
PAGEINDEX_API_KEY=your_pageindex_api_key
PAGEINDEX_BASE_URL=https://api.pageindex.ai/v1
```

## System Responsibilities
OpenAI is constrained by system prompts and evidence boundaries:
- **Allowed**: Explaining retrieved policy sections, summarizing benefits, formatting application procedures, and formulating clarification questions.
- **Prohibited**: Independent personalized eligibility decisions, inventing benefit amounts, fabricating source URLs, or ignoring retrieved evidence.

## Response Decisions
Every response returns one of four validated decisions:
1. `ANSWER`: Retrieved evidence directly supports the citizen query.
2. `CLARIFY`: Citizen query is ambiguous; clarification requested.
3. `SAFE_NO_ANSWER`: No verified official policy document supports the query.
4. `HUMAN`: Citizen requested human agent or issue requires manual review.
