# KAAPAN

## Your Guide to Government Health Benefits

KAAPAN is a production-grade, AI-assisted health insurance platform designed to bridge the gap between citizens and government healthcare benefits across India. By combining a **deterministic rule-based eligibility engine** with **vectorless, PageIndex-powered document retrieval** and **OpenAI reasoning**, KAAPAN ensures transparent scheme discovery, personalized eligibility evaluation, document requirements guidance, and grounded conversational support.

---

## Problem

Across India, millions of citizens are entitled to critical government health insurance and welfare benefits, yet fail to receive them due to systemic information barriers:

- **Fragmented Health Schemes**: Central and state governments operate over 130 distinct health schemes, each with unique criteria and application portals.
- **Complex Eligibility Criteria**: Income thresholds, age brackets, occupation categories, and household structures make self-assessment difficult.
- **Opaque Document Requirements**: Citizens often travel long distances only to be turned away for missing specific documents (e.g., Ration card type, Income certificate, Domicile proof).
- **Unclear Application Procedures**: Difficulty finding official application centers (Kiosks, CSCs, District Hospitals) or direct official government links.
- **AI Hallucinations in Welfare**: Generic LLM chatbots frequently invent non-existent rules, false eligibility guarantees, or incorrect benefit amounts.

---

## Solution

KAAPAN solves this challenge by implementing a strict architectural boundary:

> **Core Principle: AI assists. Rules decide.**

1. **Deterministic Eligibility Engine**: Evaluates user profile attributes (income, age, state, category, family size) against official JSON/SQL eligibility rules without relying on generative LLM guesses.
2. **Vectorless PageIndex RAG**: Replaces legacy vector embeddings and approximate nearest neighbor vector databases with structured **PageIndex Document Trees**. Official source documents are indexed into navigable sections, ensuring 100% verifiable citations without semantic vector noise or hallucinations.
3. **OpenAI Grounding Layer**: Formulates natural language explanations strictly from retrieved PageIndex document evidence, citing authoritative government sources with title, URL, publisher, and verification status.

---

## Key Features

- 🔍 **Scheme Discovery & Filtering**: Filter 130+ health schemes by jurisdiction (State/National), category, and eligibility status.
- 🎯 **Personalized Eligibility Engine**: Instant, deterministic check indicating matched schemes, missing criteria, and clear explanations.
- 📄 **Required Document Guidance**: Comprehensive list of mandatory and optional documents needed prior to application.
- 📍 **Application Guidance & Official Source Links**: Verified links to official portal URLs (e.g., PMJAY, CMCHIS, Karunya Arogya Suraksha).
- 🌲 **PageIndex Vectorless RAG Retrieval**: Tree-structured document navigation for precise section retrieval.
- 💬 **OpenAI Conversational Assistant**: Context-aware floating and full-page chat assistant with citation footnotes and state context preservation.
- 🛠️ **Administrative Control Portal**: Manage scheme versions, monitor RAG ingestion status, view audit logs, and oversee handoff requests.
- 👩‍💼 **Citizen Support Escalation**: Human support handoff mechanism when queries require administrative intervention.

---

## Architecture

```
                       CITIZEN / USER INTERFACE
                        (React 19 + Vite + Tailwind)
                                   │
                                   ▼
                            FASTAPI BACKEND
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
ELIGIBILITY ENGINE                                 PAGEINDEX RAG ENGINE
(Deterministic Python Rules)                      (Tree-Structured Retrieval)
         │                                                   │
         ▼                                                   ▼
SUPABASE POSTGRESQL                                 OFFICIAL SOURCE DOCUMENTS
(Profiles & Schemes DB)                           (Indexed Manifests & Trees)
                                                             │
                                                             ▼
                                                    OPENAI REASONING LAYER
                                                  (Grounded Explanations)
```

**Retrievable Document Pipeline:**
```
Official Source Documents ──► PageIndex Tree Generation ──► Relevant Section Retrieval ──► OpenAI Grounding ──► Grounded Answer + Citations
```

> **Note**: KAAPAN intentionally **does not use vector embeddings** (such as pgvector, Pinecone, FAISS, Chroma, Weaviate, Hugging Face, or DeepInfra) for RAG retrieval.

---

## Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | React 19 + Vite | Fast, responsive Single Page Application (SPA) |
| **Styling** | Tailwind CSS | Modern design system with custom UI components |
| **Backend** | Python + FastAPI | High-performance asynchronous REST API |
| **Database** | Supabase PostgreSQL / SQLAlchemy | Relational storage for profiles, schemes, and chat histories |
| **AI Reasoning** | OpenAI (gpt-4o-mini) | Conversational response formulation from evidence |
| **Retrieval Engine** | PageIndex | Tree-structured vectorless document section retrieval |
| **Caching** | Redis | Optional in-memory cache for API endpoints |
| **Containerization** | Docker + Docker Compose | Multi-stage production container setup |
| **Frontend Deployment** | Vercel | Global CDN deployment for static SPA frontend |
| **Backend Deployment** | Render | Managed Web Service execution for FastAPI backend |
| **Version Control** | Git + GitHub | Production codebase management |

---

## Project Structure

```
KAAPAN/
├── frontend/                     # React SPA Frontend
│   ├── src/
│   │   ├── components/           # UI, Navbar, FloatingChatWidget, SchemeCarousel
│   │   ├── pages/                # Dashboard, SchemeList, Eligibility, Chat, Admin
│   │   ├── services/             # Axios API client wrapper
│   │   ├── context/              # Supabase Auth Context
│   │   └── lib/                  # Helper utilities (Supabase, Scheme images)
│   ├── public/                   # Static assets & favicons
│   ├── package.json              # Node dependencies
│   ├── vite.config.js            # Vite build configuration
│   └── vercel.json               # Vercel SPA rewrite configuration
│
├── backend/                      # FastAPI Python Backend
│   ├── app/
│   │   ├── api/                  # REST endpoints (schemes, chat, eligibility, admin)
│   │   ├── core/                 # Database initialization & Redis cache
│   │   ├── models.py             # SQLAlchemy ORM models
│   │   ├── rag/pageindex/        # Vectorless PageIndex retrieval engine & tree manager
│   │   ├── services/             # Chatbot service, answerability, citation, eligibility
│   │   └── main.py               # FastAPI application entry point
│   ├── data/
│   │   ├── scheme_catalogue.csv  # 130 Scheme Metadata Catalogue
│   │   ├── source_registry.csv   # Verified official sources registry
│   │   ├── pageindex/trees/      # PageIndex document section trees
│   │   └── pageindex/manifests/  # PageIndex document manifests
│   ├── migrations/               # PostgreSQL schema migrations
│   ├── scripts/                  # Data migration & seeding scripts
│   ├── tests/                    # Pytest backend & RAG test suite
│   ├── Dockerfile                # Production multi-stage Dockerfile
│   ├── .dockerignore             # Docker build exclusion rules
│   ├── render.yaml               # Render Web Service deployment configuration
│   └── requirements.txt          # Python dependencies
│
├── docs/                         # Technical documentation & architecture reports
├── docker-compose.yml            # Local development orchestration (Backend + Redis)
├── .env.example                  # Environment variables reference template
├── .gitignore                    # Global git ignore configuration
└── README.md                     # Project documentation
```

---

## Installation & Setup

### Prerequisites
- Node.js v18+ & npm v9+
- Python 3.10+
- Git

### 1. Frontend Setup

```bash
cd swasthyasetu/frontend
npm install
```

Start the frontend development server:
```bash
npm run dev
```

### 2. Backend Setup

```bash
cd swasthyasetu/backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment (Windows PowerShell)
.\.venv\Scripts\Activate.ps1
# Active virtual environment (Linux/macOS)
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Start the backend development server:
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

---

## Environment Variables

Copy `.env.example` to create your local `.env` files.

### Backend (`swasthyasetu/backend/.env`)

| Variable | Required | Description | Safe for Frontend |
|---|---|---|---|
| `DATABASE_URL` | Optional | Supabase PostgreSQL connection string (falls back to local SQLite if unset) | ❌ NO |
| `SUPABASE_URL` | Yes | Supabase Project URL | ❌ NO |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase Service Role Key | ❌ NO |
| `OPENAI_API_KEY` | Yes | OpenAI API Key for chat reasoning | ❌ NO |
| `OPENAI_MODEL` | No | OpenAI model identifier (default: `gpt-4o-mini`) | ❌ NO |
| `PAGEINDEX_API_KEY` | Yes | PageIndex Document API Key | ❌ NO |
| `PAGEINDEX_BASE_URL` | No | PageIndex API base endpoint | ❌ NO |
| `PORT` | No | FastAPI listening port (default: `8000`) | ❌ NO |
| `HOST` | No | Server binding host (default: `0.0.0.0`) | ❌ NO |
| `FRONTEND_URL` | No | Deployed frontend domain for production CORS | ❌ NO |

### Frontend (`swasthyasetu/frontend/.env`)

| Variable | Required | Description | Safe for Frontend |
|---|---|---|---|
| `VITE_API_BASE_URL` | Yes | Base URL of FastAPI backend service | ✅ YES |
| `VITE_SUPABASE_URL` | Yes | Supabase Project URL for client authentication | ✅ YES |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase Public Anon Key for client authentication | ✅ YES |

> ⚠️ **SECURITY WARNING**: Never expose `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, or `PAGEINDEX_API_KEY` in `frontend/.env`. Only variables prefixed with `VITE_` will be bundled into client code.

---

## Database Setup

KAAPAN uses Supabase PostgreSQL for storing user profiles, scheme data, audit events, and chat sessions.

Run database migrations:
```bash
# Execute initial schema migration against your PostgreSQL instance
psql $DATABASE_URL -f swasthyasetu/backend/migrations/001_initial_schema.sql
```

Seed initial scheme data:
```bash
cd swasthyasetu/backend
.\.venv\Scripts\python.exe scripts/seed_database.py
```

---

## PageIndex Vectorless RAG Setup

KAAPAN relies on PageIndex document trees for vectorless retrieval:

1. **Source Registry**: Verified source URLs and titles are registered in `backend/data/source_registry.csv`.
2. **PageIndex Trees**: Official scheme guidelines are parsed into section trees stored under `backend/data/pageindex/trees/`.
3. **Retrieval**: The `VectorlessRetrievalEngine` matches user queries against tree sections and returns exact quoted evidence.

To test PageIndex retrieval locally:
```bash
cd swasthyasetu/backend
.\.venv\Scripts\python.exe -m pytest tests/test_vectorless_rag.py
```

---

## Running with Docker

### Local Docker Compose
Run both FastAPI Backend and Redis cache in Docker containers:

```bash
docker-compose up --build
```

Access API at `http://localhost:8000/health`.

### Standalone Backend Container
Build and run the production Docker image:

```bash
cd swasthyasetu/backend
docker build -t kaapan-backend .
docker run -p 8000:8000 --env-file .env kaapan-backend
```

---

## Testing & Quality Assurance

KAAPAN includes comprehensive automated unit, integration, and build test suites.

### Run Backend Tests (Pytest)
```bash
cd swasthyasetu/backend
.\.venv\Scripts\python.exe -m pytest
```

### Run Frontend Production Build Validation
```bash
cd swasthyasetu/frontend
npm run build
```

### Run Frontend Linter (Oxlint)
```bash
cd swasthyasetu/frontend
npm run lint
```

---

## Production Deployment

### Frontend Deployment (Vercel)
1. Import repository to Vercel.
2. Set Root Directory to `swasthyasetu/frontend`.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Configure Environment Variables:
   - `VITE_API_BASE_URL`: `https://kaapan-backend.onrender.com`
   - `VITE_SUPABASE_URL`: `https://<your-project>.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `<your-anon-key>`
6. Deploy.

### Backend Deployment (Render)
1. Create a new **Web Service** on Render.
2. Select repository and set Root Directory to `swasthyasetu/backend`.
3. Runtime: `Python`
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Health Check Path: `/health`
7. Configure Environment Variables (`OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PAGEINDEX_API_KEY`, `FRONTEND_URL`).
8. Deploy.

---

## Production Readiness Checklist

- [x] Unnecessary & legacy chatbot files removed
- [x] Secrets purged from git history and code
- [x] Environment variable templates (`.env.example`) configured
- [x] PostgreSQL database migration scripts verified
- [x] PageIndex vectorless RAG engine verified (0 embedding vectors required)
- [x] Production CORS middleware configured
- [x] Security headers middleware enabled (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`)
- [x] Health check endpoints (`/health` and `/health/ready`) implemented
- [x] Multi-stage non-root Dockerfile created
- [x] Production ASGI server start command configured without `--reload`
- [x] 32/32 backend pytest integration tests passing
- [x] Vite production frontend build succeeding without errors
- [x] README.md rewritten for production architecture

---

## Data Accuracy & Disclaimer

> ⚠️ **DISCLAIMER**: KAAPAN is an AI-assisted discovery platform. Scheme eligibility, document requirements, and benefit entitlements must ultimately be confirmed against official government portals or designated district authorities. The AI assistant relies strictly on grounded source documents and is constrained from inventing policy rules or benefit claims.

---

## License

This project is licensed under the MIT License.
