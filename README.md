# KAAPAN

### Your Guide to Government Health Benefits

AI-assisted discovery, eligibility guidance and official-source navigation for government health schemes.

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python)](https://www.python.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-gpt--4o--mini-412991?logo=openai)](https://openai.com/)
[![PageIndex](https://img.shields.io/badge/PageIndex-Vectorless_RAG-FF6B6B)](https://pageindex.ai/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?logo=redis)](https://redis.io/)
[![Status](https://img.shields.io/badge/Status-Active_Development-success)]()

KAAPAN is an AI-assisted government health benefits and scheme discovery platform designed to help citizens discover relevant schemes, understand eligibility, identify required documents, and navigate official application procedures.

By bridging the gap between citizens and public healthcare infrastructure, KAAPAN combines **deterministic eligibility logic**, **AI-assisted conversational interaction**, **official-source document retrieval**, **scheme discovery**, **document guidance**, and **application navigation** into a single grounded platform.

[Try KAAPAN Live Demo](https://ai-health-insurance-portal.vercel.app) • [GitHub Repository](https://github.com/barath-roshan/AI-Health-Insurance-Portal)

---

## The Problem

Across India, millions of eligible citizens fail to receive critical government health benefits, welfare programs, and medical financial assistance due to systemic information barriers:

- **Fragmented Health Information**: Central and state governments operate hundreds of distinct health schemes across separate websites, portals, and departments.
- **Complex Eligibility Criteria**: Income thresholds, age brackets, occupation categories, household demographics, and state domicile rules make self-assessment confusing.
- **Opaque Document Requirements**: Citizens often travel long distances to government centers only to be turned away for missing specific documents (e.g., specific ration card types, income certificates, or domicile proofs).
- **Unclear Application Procedures**: Difficulty identifying official application channels (Common Service Centers, District Hospitals, or online government kiosks).
- **State-Specific Differences**: Broad variations in coverage, eligibility rules, and application workflows between individual states and national schemes.
- **Outdated or Conflicting Information**: Inconsistent guidelines scattered across unofficial blogs, third-party sites, and outdated news articles.
- **Limitations of Un-grounded AI Chatbots**: Generic LLM chatbots frequently hallucinate non-existent rules, false eligibility guarantees, or wrong benefit amounts when asked about government schemes.

Simply feeding government information into a standard chatbot is insufficient because citizens need **evidence-backed answers** and **deterministic rule-based reasoning** for eligibility.

---

## The Solution

KAAPAN provides a single unified assistance layer over government health-benefit information, ensuring transparency, accuracy, and clear direction.

```
                                  USER QUERY
                                      │
                                      ▼
                                   KAAPAN
                                      │
                                      ▼
                            Understand the Request
                                      │
                                      ▼
                           Identify Relevant Schemes
                                      │
                                      ▼
                 Apply Deterministic Eligibility Rules (Where Applicable)
                                      │
                                      ▼
                     Retrieve Supporting Official Evidence
                                      │
                                      ▼
                            AI Explains the Result
                                      │
                                      ▼
                    Official Source & Application Guidance
```

### Core Principle: AI assists. Rules decide.

KAAPAN operates on a strict separation of responsibilities:
- **Deterministic Rules Decide**: Personalized eligibility checks and policy conditions are evaluated using explicit Python logic against verified scheme rules. Generative LLMs are never permitted to independently decide or invent eligibility outcomes.
- **Generative AI Assists**: OpenAI (`gpt-4o-mini`) handles natural language understanding, evidence interpretation, context tracking, and clear conversational explanations grounded strictly in official source documents.

---

## Key Features

### 🔎 Scheme Discovery
Citizens can discover relevant government health schemes based on state/jurisdiction, category, user demographic profiles, or natural-language questions.

### ✅ Eligibility Guidance
Evaluates eligibility using deterministic rule matching based on age, income, caste/category, occupation, family size, and state domicile. The engine identifies matching criteria as well as missing requirements.

### 📄 Document Guidance
Displays detailed mandatory and optional document requirements (e.g., Aadhaar, Income Certificate, Ration Card, Domicile Certificate) needed before beginning an application.

### 🏛️ Official Application Guidance
Provides step-by-step instructions on where and how to apply, accompanied by direct verified links to official government portals (e.g., PM-JAY, CMCHIS, Karunya Arogya Suraksha).

### 🤖 AI Assistant
A conversational chat assistant powered by OpenAI that maintains conversation context, answers citizen questions, and explains complex policy guidelines in accessible language.

### 📚 Grounded Retrieval
Utilizes PageIndex vectorless retrieval to fetch precise section content from official government document trees, ensuring responses are backed by verified policy text.

### 🔗 Source Citations
Every AI explanation exposes clear source titles, document references, and official URLs. Responses avoid unreferenced claims or empty citation links.

### 🌎 State-Aware Discovery
Jurisdiction-aware filtering correctly distinguishes national schemes from state-specific schemes. Requests like *"List schemes for Tamil Nadu"* and *"List schemes for Kerala"* return accurate state-filtered results.

### 📱 Responsive UI
A modern, accessible, mobile-responsive user interface built with React 19 and Tailwind CSS, providing seamless navigation across desktop and mobile devices.

### 🛠️ Administrative Portal & Citizen Support
Includes an administrative control dashboard to monitor scheme versions, oversee PageIndex retrieval status, view audit logs, and manage citizen support escalation requests when human assistance is required.

---

## AI Architecture

KAAPAN integrates document indexing, structured retrieval, deterministic rule logic, and conversational reasoning.

```
Official Government Documents
        ↓
    PageIndex
        ↓
Relevant Document Sections
        ↓
     OpenAI
        ↓
Grounded Response
        ↓
  Source Citation
```

### Component Roles

- **PageIndex**: Indexes official government policy documents into structured document trees and retrieves precise relevant sections without vector embedding noise.
- **OpenAI (`gpt-4o-mini`)**: Interprets citizen queries, analyzes retrieved document evidence, and generates natural-language explanations grounded strictly in the retrieved text.
- **Eligibility Engine**: Evaluates user profile attributes against deterministic rule definitions to yield reproducible eligibility verdicts.

> **Important Note**: OpenAI assists with interpretation and explanation, while deterministic rules handle eligibility decisions where applicable. OpenAI does not decide eligibility.

---

## Why Vectorless RAG?

Retrievable document architecture is a critical technical decision for welfare guidance applications.

### Traditional Vector RAG Architecture
```
Documents ──► Chunking ──► Embeddings ──► Vector Database ──► Similarity Search ──► LLM
```

### KAAPAN Vectorless RAG Architecture
```
Official Documents ──► PageIndex ──► Document Structure / Relevant Sections ──► OpenAI ──► Grounded Answer
```

### Technical Rationale for Exploring Vectorless RAG

- **Eliminates Embedding Generation**: Removes reliance on external embedding models and vector generation pipelines.
- **Eliminates Vector Database Overhead**: Reduces infrastructure complexity by eliminating separate vector stores (e.g., pgvector, Pinecone, FAISS).
- **Reduces Infrastructure Failure Points**: Minimizes points of failure associated with vector indexing, dimensional mismatches, and database sync.
- **Preserves Document Hierarchy**: Tree-structured navigation preserves document headings, sections, and parent-child policy relationships.
- **Improves Traceability**: Enables direct page and section references for source citations.
- **Suited for Authoritative Documents**: Highly effective for structured government notifications, scheme guidelines, and policy acts.

> **Retrieval Strategy Note**: Vectorless RAG is an alternative retrieval strategy. Its suitability depends on the corpus, document structure, scale and retrieval requirements.

---

## Engineering Challenges

During the development of KAAPAN, several core engineering challenges were addressed:

### 1. RAG Infrastructure Complexity
Initial RAG architecture required database migrations, embedding pipelines, vector stores, and fallback mechanisms. This demonstrated how infrastructure failures can silently degrade retrieval strategies, leading to the exploration of structured PageIndex retrieval.

### 2. Retrieval Reliability
Ensuring high answerability required structuring input document trees effectively, tuning search depth, handling ambiguous citizen queries, and validating source document quality.

### 3. Context-Aware Conversations
Multi-turn conversations required preserving jurisdiction and state context across follow-up questions. For instance, when a user asks:
- Query 1: *"List health schemes for Tamil Nadu"*
- Query 2: *"What documents do I need for the first one?"*
The system must preserve `jurisdiction = Tamil Nadu` and target scheme context across turns.

### 4. Jurisdiction Filtering
Distinguishing general scheme discovery (`SCHEME_DISCOVERY`) from state-specific queries (`SCHEME_DISCOVERY + JURISDICTION = Tamil Nadu`) required explicit intent detection and query classification logic.

### 5. Source Grounding & Citation Quality
Preventing hallucinations required enforcing strict answerability checks. If retrieved evidence is insufficient, the system acknowledges missing information rather than generating arbitrary claims or empty citation links.

### 6. Data Quality & Scheme Verification
Government scheme metadata requires continuous validation, jurisdiction mapping, source URL tracking, document versioning, and clear identification of verification timestamps.

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 19 + Vite | Fast, responsive Single Page Application (SPA) |
| **Styling** | Tailwind CSS (v4) | Utility-first responsive design system |
| **UI Components & Icons** | Lucide React | Modern interface icons |
| **Client Routing** | React Router DOM (v7) | Declarative single-page application routing |
| **Backend Framework** | FastAPI (Python 3.10+) | High-performance asynchronous REST API |
| **ASGI Web Server** | Uvicorn | Production ASGI server implementation |
| **Database & ORM** | Supabase PostgreSQL / SQLAlchemy | Relational storage for profiles, schemes, and logs |
| **AI Reasoning** | OpenAI (`gpt-4o-mini`) | Conversational reasoning over retrieved evidence |
| **Retrieval Engine** | PageIndex | Tree-structured vectorless document section retrieval |
| **Authentication** | Supabase Auth | User authentication and session handling |
| **Caching Layer** | Redis | In-memory response caching for API performance |
| **Containerization** | Docker & Docker Compose | Containerized backend and service setup |
| **Frontend Host** | Vercel | Global CDN deployment for static SPA frontend |
| **Backend Host** | Render | Managed Web Service execution for FastAPI |

---

## Project Structure

```
AI-Health-Insurance-platform/
├── swasthyasetu/
│   ├── frontend/                     # React SPA Frontend
│   │   ├── src/
│   │   │   ├── components/           # Navbar, Footer, FloatingChatWidget, SchemeCarousel
│   │   │   ├── pages/                # Dashboard, SchemeList, Eligibility, Chat, AdminDashboard
│   │   │   ├── services/             # Axios API client wrapper (`api.js`)
│   │   │   ├── context/              # Supabase Auth Context (`AuthContext.jsx`)
│   │   │   ├── hooks/                # React hooks (`useAuth.js`)
│   │   │   └── lib/                  # Helper utilities & Supabase client setup
│   │   ├── public/                   # Favicons, logo assets, and icons
│   │   ├── .env.example              # Frontend environment reference
│   │   ├── package.json              # Frontend Node.js dependencies
│   │   ├── vite.config.js            # Vite bundler configuration
│   │   └── vercel.json               # Vercel SPA routing rewrite rules
│   │
│   ├── backend/                      # FastAPI Python Backend
│   │   ├── app/
│   │   │   ├── api/                  # REST endpoints (schemes, chat, eligibility, profile, support, admin)
│   │   │   ├── core/                 # Database initialization, Redis cache, database seeder
│   │   │   ├── models.py             # SQLAlchemy ORM models (schemes, profiles, logs, versions)
│   │   │   ├── rag/pageindex/        # PageIndex retrieval client, tree manager, ingestion pipeline
│   │   │   ├── schemas/              # Pydantic schemas for request/response validation
│   │   │   ├── services/             # Chatbot service, eligibility engine, citation & context services
│   │   │   └── main.py               # FastAPI application entry point & CORS configuration
│   │   ├── data/
│   │   │   ├── kaapan_schemes_catalogue.json  # Comprehensive scheme catalogue dataset
│   │   │   ├── scheme_catalogue.csv           # CSV scheme metadata export
│   │   │   ├── source_registry.csv            # Official government source registry
│   │   │   └── pageindex/                     # PageIndex document trees and manifests
│   │   ├── migrations/               # PostgreSQL schema migration scripts (`001_initial_schema.sql`)
│   │   ├── scripts/                  # Seed scripts and dataset migration utilities
│   │   ├── tests/                    # Pytest test suite (32 passing integration/unit tests)
│   │   ├── Dockerfile                # Production multi-stage Dockerfile
│   │   ├── .env.example              # Backend environment reference
│   │   ├── render.yaml               # Render Web Service deployment configuration
│   │   └── requirements.txt          # Python dependencies
│   │
│   └── docs/                         # Architecture documentation & technical reports
│
├── docker-compose.yml                # Development orchestration (FastAPI + Redis)
├── .env.example                      # Root environment reference
├── .gitignore                        # Git exclusion rules
└── README.md                         # Primary project documentation
```

---

## Getting Started

### Prerequisites
- **Node.js**: v18+ & **npm**: v9+
- **Python**: 3.10+
- **Git**

### 1. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd swasthyasetu/frontend
npm install
```

Start the frontend development server:

```bash
npm run dev
```

The frontend application will run locally at `http://localhost:5173`.

### 2. Backend Setup

Navigate to the backend directory and create a virtual environment:

```bash
cd swasthyasetu/backend
python -m venv .venv
```

Activate the virtual environment:

```bash
# Windows PowerShell
.\.venv\Scripts\Activate.ps1

# Linux / macOS
# source .venv/bin/activate
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI development server:

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The API documentation will be available at `http://127.0.0.1:8000/docs`.

---

## Environment Variables

Copy the provided `.env.example` templates to create local `.env` files.

### Backend Environment (`swasthyasetu/backend/.env`)

| Variable | Description | Safe for Client/Frontend |
|---|---|---|
| `DATABASE_URL` | Supabase PostgreSQL connection string (falls back to local SQLite if unset) | ❌ NO |
| `SUPABASE_URL` | Supabase project endpoint URL | ❌ NO |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role key for administrative operations | ❌ NO |
| `OPENAI_API_KEY` | OpenAI API key for chat reasoning and evidence grounding | ❌ NO |
| `OPENAI_MODEL` | OpenAI model identifier (default: `gpt-4o-mini`) | ❌ NO |
| `PAGEINDEX_API_KEY` | PageIndex document API key for vectorless retrieval | ❌ NO |
| `PAGEINDEX_BASE_URL` | PageIndex API base endpoint URL | ❌ NO |
| `REDIS_HOST` | Redis cache hostname (default: `127.0.0.1`) | ❌ NO |
| `REDIS_PORT` | Redis cache port (default: `6379`) | ❌ NO |
| `PORT` | FastAPI server port (default: `8000`) | ❌ NO |
| `HOST` | FastAPI server bind host (default: `127.0.0.1`) | ❌ NO |
| `FRONTEND_URL` | Allowed frontend origin URL for production CORS policy | ❌ NO |

### Frontend Environment (`swasthyasetu/frontend/.env`)

| Variable | Description | Safe for Client/Frontend |
|---|---|---|
| `VITE_API_BASE_URL` | FastAPI backend base URL endpoint (e.g., `http://localhost:8000`) | ✅ YES |
| `VITE_SUPABASE_URL` | Supabase project endpoint URL for client authentication | ✅ YES |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous public key for client authentication | ✅ YES |

> ⚠️ **SECURITY DIRECTIVE**: Never commit real secrets to version control. Never expose backend-only secrets (`OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PAGEINDEX_API_KEY`) in frontend configuration files. Only variables prefixed with `VITE_` are bundled into client assets.

---

## Database

KAAPAN utilizes **Supabase PostgreSQL** for storing profiles, scheme data, audit trails, and chat history.

### Schema Setup & Migrations
Database tables are initialized using SQLAlchemy ORM or by running SQL migration scripts:

```bash
# Execute initial schema migration against your PostgreSQL instance
psql $DATABASE_URL -f swasthyasetu/backend/migrations/001_initial_schema.sql
```

### Core Database Tables
- `users` & `user_profiles`: User accounts, age, income bracket, domicile state, category, and household attributes.
- `schemes` & `scheme_versions`: Master scheme records, eligibility criteria rules, document requirements, and version history.
- `support_requests`: Citizen support escalation cases for human administrative assistance.
- `audit_logs`: Audit trail for scheme modifications, ingestion events, and administrative actions.
- `chat_sessions` & `chat_messages`: Multi-turn chat context and grounded Q&A interaction logs.

---

## Scheme Data

The current scheme dataset (`kaapan_schemes_catalogue.json` and `scheme_catalogue.csv`) contains structured records covering national and state-level healthcare programs.

### Scheme Catalogue Schema
Each scheme record includes:
- `scheme_name`: Official title of the scheme.
- `jurisdiction`: National or specific State / UT (e.g., `Tamil Nadu`, `Kerala`, `National`).
- `category`: Scheme classification (e.g., Health Insurance, Maternal Health, Child Health, Public Services).
- `description`: Overview of coverage and benefits.
- `eligibility_criteria`: Structured eligibility conditions (income limit, age range, domicile, category).
- `required_documents`: Mandatory and optional documentation.
- `where_to_apply`: Application centers, hospital networks, or online portals.
- `official_url`: Verified link to official government portal.
- `source_url`: Authoritative source document link.
- `verification_status`: Verification state (`VERIFIED`, `PENDING_REVIEW`).
- `last_verified`: Date of last metadata verification.

> **Data Authority Notice**: The scheme catalogue metadata supports fast discovery and filtering. Official government policy documents and indexed PageIndex trees serve as the primary evidence layer for grounded AI answers. Seed metadata is not treated as absolute legal authority.

---

## Testing

The codebase includes an automated test suite covering eligibility evaluation, scheme filtering, RAG retrieval, and integration endpoints.

### Backend Automated Tests (Pytest)

Run all 32 backend unit and integration tests:

```bash
cd swasthyasetu/backend
.\.venv\Scripts\python.exe -m pytest
```

Test modules cover:
- `test_eligibility.py`: Deterministic rule evaluator and profile validator.
- `test_vectorless_rag.py`: PageIndex retrieval client and section matching.
- `test_excel_dataset_ingestion.py`: Dataset loading and schema validation.
- `test_bugs_fix_verification.py`: Verification of edge-case bug fixes.
- `test_phase5_integration.py`: End-to-end FastAPI endpoint integration tests.

### Frontend Production Build Verification

Verify that the React production bundle builds cleanly:

```bash
cd swasthyasetu/frontend
npm run build
```

Run the Oxlint frontend linter:

```bash
cd swasthyasetu/frontend
npm run lint
```

---

## Deployment

### Frontend Deployment (Vercel)
1. Import repository to Vercel.
2. Set Root Directory to `swasthyasetu/frontend`.
3. Framework Preset: `Vite`.
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Environment Variables:
   - `VITE_API_BASE_URL`: `https://ai-health-insurance-portal.onrender.com`
   - `VITE_SUPABASE_URL`: `https://<your-project>.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `<your-anon-key>`

### Backend Deployment (Render)
1. Create a **Web Service** on Render connected to the repository.
2. Set Root Directory to `swasthyasetu/backend`.
3. Runtime: `Python`
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Health Check Path: `/health` (Readiness: `/health/ready`)
7. Set environment variables: `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PAGEINDEX_API_KEY`, `FRONTEND_URL`.

---

## Security

KAAPAN adheres to standard software security practices:

- **Environment Key Isolation**: Server API keys (`OPENAI_API_KEY`, `PAGEINDEX_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are restricted to the backend and never exposed in client bundles.
- **Input Validation**: Request payloads are validated against Pydantic schemas before processing.
- **CORS Restrictions**: Configured cross-origin resource sharing policies limit API access to authorized frontend domains.
- **Security Headers**: Middleware enforces defensive HTTP response headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`).
- **Database Access Control**: Relational queries use parameterized SQLAlchemy ORM models to prevent SQL injection vulnerabilities.

---

## Design Philosophy

### AI Assists. Rules Decide.

Generative artificial intelligence is highly effective for natural language understanding, context tracking, simplifying complex bureaucratic language, and explaining policy guidelines to citizens.

However, generative LLMs must not be relied upon to invent policy rules, calculate income eligibility thresholds, or guarantee scheme benefits independently.

By delegating **eligibility logic to deterministic code** and **conversational assistance to grounded LLMs**, KAAPAN ensures both usability and technical reliability.

---

## Limitations

- **Evolving Policy Rules**: Government scheme guidelines, income limits, and application procedures change periodically.
- **Regional Variations**: Specific state implementation guidelines may vary between districts.
- **Continuous Ingestion Requirement**: Grounded retrieval quality depends on keeping indexed source document trees up to date.
- **Evidence Dependency**: The AI assistant answers based on retrieved document sections; un-indexed policies cannot be answered with high confidence.
- **Non-Government Status**: KAAPAN is an independent guidance platform and is not a legal or official government authority. Citizens must confirm final eligibility with designated official authorities.

---

## Built During Hack Odyssey 4.0

KAAPAN was originally conceived and built during the 24-hour **Hack Odyssey 4.0** hackathon organized by Kalasalingam University.

Over a 24-hour period, the project progressed from initial architecture to full-stack implementation, database setup, RAG integration, and production deployment.

> *"Although we did not take home the winning prize, the hackathon gave us something equally valuable — hands-on experience taking an AI product from an idea to a deployed application under real time constraints."*

---

## Live Demo

- **Live Application**: [Try KAAPAN on Vercel](https://ai-health-insurance-portal.vercel.app)

---

## Roadmap

- [ ] Expand verified scheme coverage across all 28 States and 8 Union Territories.
- [ ] Implement enhanced regional language support (Hindi, Tamil, Malayalam, Telugu, Kannada, Bengali).
- [ ] Develop automated web monitors for tracking government policy document updates.
- [ ] Enhance household profile matching for multi-member family eligibility assessment.
- [ ] Improve accessibility features to meet WCAG 2.1 AA guidelines.
- [ ] Expand automated evaluation benchmarks for RAG retrieval accuracy.

---

## Acknowledgements

- [OpenAI](https://openai.com/) — Natural language reasoning & grounded conversational synthesis
- [PageIndex](https://pageindex.ai/) — Vectorless tree-structured document retrieval
- [Supabase](https://supabase.com/) — Relational PostgreSQL database & authentication
- [FastAPI](https://fastapi.tiangolo.com/) — High-performance Python backend framework
- [React](https://react.dev/) — Single Page Application UI framework
- [Vite](https://vitejs.dev/) — Next-generation frontend tooling
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first styling framework
