-- Migration 002: Create scheme_knowledge table and pgvector index
CREATE TABLE IF NOT EXISTS scheme_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_id TEXT UNIQUE NOT NULL,
  category TEXT,
  state_or_region TEXT,
  scheme_name TEXT NOT NULL,
  scheme_description TEXT,
  scheme_eligibility TEXT,
  keywords TEXT[],
  search_aliases TEXT[],
  intent_tags TEXT[],
  searchable_text TEXT NOT NULL,
  source_url TEXT,
  source_type TEXT,
  verification_status TEXT DEFAULT 'needs_verification',
  last_verified_at TIMESTAMPTZ,
  version INTEGER,
  notes TEXT,
  embedding VECTOR(1024),
  embedding_model TEXT,
  embedding_dimensions INTEGER,
  searchable_text_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast cosine vector similarity search
CREATE INDEX IF NOT EXISTS idx_scheme_knowledge_embedding 
ON scheme_knowledge 
USING hnsw (embedding vector_cosine_ops);

-- Indexes for metadata filtering
CREATE INDEX IF NOT EXISTS idx_scheme_knowledge_category ON scheme_knowledge (category);
CREATE INDEX IF NOT EXISTS idx_scheme_knowledge_state ON scheme_knowledge (state_or_region);
CREATE INDEX IF NOT EXISTS idx_scheme_knowledge_verification ON scheme_knowledge (verification_status);
