# Security Review & Hardening Report

## Security Audit Summary

1. **Authentication & Authorization**:
   - Supabase JWT token verification via FastAPI headers.
   - Admin authorization enforced with `verify_admin_role` checking `X-User-Role: ADMIN` header. Non-admin access returns `403 Forbidden`.

2. **Prompt Injection Defense**:
   - Document section text retrieved from PageIndex is sanitized and wrapped as untrusted data in LLM prompts.
   - Instructions inside retrieved documents are isolated from system prompt instructions.

3. **Data Protection & Secret Hygiene**:
   - API keys (`OPENAI_API_KEY`, `PAGEINDEX_API_KEY`) are read strictly from environment variables and never logged or exposed in frontend bundles.
   - Database operations enforce ownership checks on citizen support requests.
