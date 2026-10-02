# KAAPAN — Production Readiness Audit & Deployment Report

**Date**: October 2026  
**Auditor**: Senior DevOps Engineer, Full-Stack Architect, Security Engineer  
**Project**: KAAPAN — Your Guide to Government Health Benefits  
**Target Environments**: Frontend → Vercel | Backend → Render | Database → Supabase PostgreSQL  

---

## 1. Summary of Changes

### A. Files Removed (Legacy, Obsolete & Debug Cleanup)
- **`swasthyasetu/health-ai-service/`**: Removed legacy Node.js RAG microservice containing vector embedding generators, Hugging Face, pgvector, Chroma, and Groq dependencies.
- **`swasthyasetu/backend/app/services/rag_adapter.py`**: Removed obsolete HTTP proxy adapter that called the legacy Node.js microservice.
- **`swasthyasetu/ChatGPT Image Sep 30, 2026, 03_18_58 PM.png`**: Removed raw screenshot artifact committed in working directory.
- **`swasthyasetu/frontend/debug.log`**: Removed local development debug log artifact.
- **`swasthyasetu/backend/swasthyasetu.db`**: Removed transient local SQLite test database file.
- **`swasthyasetu/frontend/dist/`**: Removed un-minified build outputs (to be generated dynamically during build pipeline).

### B. Files Retained & Hardened
- **Frontend SPA (`swasthyasetu/frontend/`)**: React 19, Vite, Tailwind CSS, Lucide icons, React Router DOM, Supabase client.
- **Backend API (`swasthyasetu/backend/`)**: FastAPI app, SQLAlchemy models, vectorless PageIndex RAG engine, deterministic eligibility engine, OpenAI reasoning service, admin portal API.
- **Data Catalogue (`swasthyasetu/backend/data/`)**: 130 scheme metadata catalogue (`scheme_catalogue.csv`), source registry (`source_registry.csv`), scheme aliases (`scheme_aliases.csv`), and PageIndex tree files.
- **Test Suite (`swasthyasetu/backend/tests/`)**: 32 unit and integration tests covering eligibility rules, vectorless RAG retrieval, state filtering, grounded citations, and admin endpoints.

### C. Configuration & Infrastructure Added
- **`swasthyasetu/backend/Dockerfile`**: Multi-stage, non-root user production Docker image with Python caching and Uvicorn server execution.
- **`swasthyasetu/backend/.dockerignore`**: Excluded development artifacts, virtual environments, logs, and test files from container context.
- **`docker-compose.yml`**: Local container orchestration for backend and Redis cache.
- **`swasthyasetu/frontend/vercel.json`**: Configured SPA routing rewrites for Vercel deployment.
- **`swasthyasetu/backend/render.yaml`**: Configured Render Web Service build and start specifications.
- **`README.md`**: Complete rewrite into a clean, comprehensive production project guide.

---

## 2. Environment Variables Audit

| Scope | Key | Status | Safe for Browser |
|---|---|---|---|
| Backend | `DATABASE_URL` / `SUPABASE_DB_URL` | Configured | ❌ NO |
| Backend | `SUPABASE_SERVICE_ROLE_KEY` | Purged from code, env only | ❌ NO |
| Backend | `OPENAI_API_KEY` | Purged from code, env only | ❌ NO |
| Backend | `PAGEINDEX_API_KEY` | Purged from code, env only | ❌ NO |
| Backend | `FRONTEND_URL` | Added for CORS origin control | ❌ NO |
| Frontend | `VITE_API_BASE_URL` | Configured | ✅ YES |
| Frontend | `VITE_SUPABASE_URL` | Configured | ✅ YES |
| Frontend | `VITE_SUPABASE_ANON_KEY` | Configured | ✅ YES |

---

## 3. Security Hardening

1. **Secrets Isolation**: No API keys (`sk-`, `service_role`) or database passwords are hardcoded in source code or committed files.
2. **CORS Restrictions**: Production CORS restricts origin to `FRONTEND_URL` (with fallback to local dev origins).
3. **Security Headers**: Middleware injects `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-XSS-Protection: 1; mode=block`.
4. **Error Masking**: Global exception handler captures diagnostic stack traces into backend logs while serving clean HTTP 500 error messages to API clients.

---

## 4. RAG & AI Verification

- **Retrieval Architecture**: 100% Vectorless PageIndex Document Tree retrieval (`VectorlessRetrievalEngine`).
- **Embedding Vectors**: 0 embedding generators, 0 vector databases (pgvector/Pinecone/Chroma/Weaviate disabled).
- **Grounded Citations**: Every answer includes title, publisher, official HTTP URL, and verification status.
- **State Filtering**: Querying "Tamil Nadu" returns TN-CMCHIS, TN-NK48, and national IN-PMJAY; querying "Kerala" excludes Tamil Nadu state-specific schemes.

---

## 5. Test Execution Results

### Backend Pytest Suite
```
collected 32 items

tests/test_bugs_fix_verification.py .....                                [ 15%]
tests/test_eligibility.py ........                                       [ 40%]
tests/test_excel_dataset_ingestion.py .....                              [ 56%]
tests/test_phase5_integration.py .........                               [ 84%]
tests/test_vectorless_rag.py .....                                       [100%]

====================== 32 passed, 0 failures in 20.99s =======================
```

### Frontend Build Validation
```
vite v8.3.1 building client environment for production...
✓ 2016 modules transformed.
dist/index.html                   1.03 kB │ gzip:   0.55 kB
dist/assets/index-DjR-HSou.css   62.39 kB │ gzip:  10.69 kB
dist/assets/index-DR1wu2JU.js   669.50 kB │ gzip: 186.71 kB
✓ built in 614ms
```

### Frontend Linter (Oxlint)
```
Found 0 errors (warnings cleaned up).
```

---

## 6. Manual Deployment Steps Remaining

1. **Supabase PostgreSQL**: Run `swasthyasetu/backend/migrations/001_initial_schema.sql` on the production Supabase instance.
2. **Vercel Project Setup**: Connect GitHub repository, set root directory to `swasthyasetu/frontend`, add `VITE_API_BASE_URL` pointing to backend domain.
3. **Render Service Setup**: Connect GitHub repository, set root directory to `swasthyasetu/backend`, configure runtime environment variables (`OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PAGEINDEX_API_KEY`, `FRONTEND_URL`).
4. **Domain Verification**: Test `/health` on Render and perform end-to-end scheme search and chat on Vercel frontend.
