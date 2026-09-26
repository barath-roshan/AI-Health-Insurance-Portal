# KAAPAN — Your Guide to Government Health Benefits

> An AI-powered platform that helps citizens discover and check their eligibility for government health insurance schemes across India.

---

## 🏗️ Architecture

```
AI-Health-Insurance-platform/
└── swasthyasetu/
    ├── backend/          # FastAPI — REST API + eligibility engine
    ├── frontend/         # Vite + React — KAAPAN web app
    ├── health-ai-service/# Node.js — RAG chatbot (E5 + pgvector + Groq)
    └── docs/             # Design reports & documentation
```

---

## ✨ Features

- 🔍 **Scheme Discovery** — browse 900+ central & state health schemes
- ✅ **Eligibility Checker** — rule-based engine with deterministic results
- 🤖 **AI Chatbot (KAAPAN)** — RAG pipeline using multilingual E5 embeddings, Supabase pgvector, and Groq LLM
- 🔐 **Auth** — Supabase Auth (email/password)
- 🛡️ **Admin Dashboard** — manage schemes, users, and support tickets

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| Python | ≥ 3.10 |
| Node.js | ≥ 18 |
| npm | ≥ 9 |

You also need accounts / API keys for:
- [Supabase](https://supabase.com) — database + auth
- [Hugging Face](https://huggingface.co) — E5 embedding model
- [Groq](https://groq.com) — LLM inference

---

### 1. Clone

```bash
git clone https://github.com/<your-username>/AI-Health-Insurance-platform.git
cd AI-Health-Insurance-platform
```

---

### 2. Backend (FastAPI)

```bash
cd swasthyasetu/backend

# Create virtualenv
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and fill in your Supabase credentials

# Run
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

API docs available at: http://127.0.0.1:8000/docs

---

### 3. Health AI Service (RAG Chatbot)

```bash
cd swasthyasetu/health-ai-service

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Supabase, HuggingFace, and Groq credentials

# (First time only) Run Supabase migration to create pgvector tables
# Apply swasthyasetu/health-ai-service/supabase/consolidated_migrations.sql
# in your Supabase SQL editor

# (First time only) Generate and upload embeddings
npm run embeddings

# Start the service
npm run dev
```

RAG service runs at: http://localhost:5000

---

### 4. Frontend (Vite + React)

```bash
cd swasthyasetu/frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Supabase URL and anon key

# Start dev server
npm run dev
```

App runs at: http://localhost:5173

---

## 🗄️ Supabase Setup

1. Create a new Supabase project
2. Enable the **pgvector** extension: `Database → Extensions → vector`
3. Run the migration SQL in your Supabase SQL editor:
   ```
   swasthyasetu/health-ai-service/supabase/consolidated_migrations.sql
   ```
4. Copy your project URL, anon key, and service role key into all `.env` files

---

## 📁 Environment Variables Reference

### `backend/.env`
| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-side only) |
| `RAG_SERVICE_URL` | URL of the health-ai-service (default: `http://127.0.0.1:5000`) |

### `health-ai-service/.env`
| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `HF_TOKEN` | HuggingFace API token |
| `HF_EMBEDDING_MODEL` | `intfloat/multilingual-e5-large` |
| `GROQ_API_KEY` | Groq API key |
| `GROQ_MODEL` | e.g. `openai/gpt-oss-120b` |

### `frontend/.env`
| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (public) |
| `VITE_API_BASE_URL` | Backend URL (default: `http://localhost:8000`) |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, CSS Variables |
| Backend | FastAPI, Python 3.10+ |
| RAG Service | Node.js, Express, HuggingFace E5, Groq |
| Vector DB | Supabase (PostgreSQL + pgvector) |
| Auth | Supabase Auth |
| Icons | Lucide React |

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.
