-- Clean Reset and Setup for KAAPAN Supabase Database
-- Run this script in the Supabase SQL Editor: https://supabase.com/dashboard/project/bmsfcdvnammmsghktufz/sql/new

DROP FUNCTION IF EXISTS public.match_scheme_chunks CASCADE;
DROP TABLE IF EXISTS public.scheme_knowledge CASCADE;

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;
SET search_path TO public, extensions;

CREATE TABLE public.scheme_knowledge (
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
  embedding extensions.vector(1024),
  embedding_model TEXT,
  embedding_dimensions INTEGER,
  searchable_text_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scheme_knowledge_embedding 
ON public.scheme_knowledge 
USING hnsw (embedding extensions.vector_cosine_ops);

CREATE INDEX idx_scheme_knowledge_category ON public.scheme_knowledge (category);
CREATE INDEX idx_scheme_knowledge_state ON public.scheme_knowledge (state_or_region);
CREATE INDEX idx_scheme_knowledge_verification ON public.scheme_knowledge (verification_status);

CREATE TABLE IF NOT EXISTS public.scheme_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  rules_json JSONB,
  source_url TEXT,
  source_hash TEXT,
  effective_from TIMESTAMPTZ,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  intent TEXT,
  decision TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.handoff_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT,
  user_query TEXT NOT NULL,
  intent TEXT,
  reason TEXT,
  summary TEXT,
  retrieved_schemes JSONB,
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.match_scheme_chunks (
  query_embedding extensions.vector(1024),
  match_threshold FLOAT DEFAULT 0.0,
  match_count INT DEFAULT 5,
  filter_category TEXT DEFAULT NULL,
  filter_state_or_region TEXT DEFAULT NULL,
  filter_verification_status TEXT DEFAULT NULL,
  filter_scheme_id TEXT DEFAULT NULL
)
RETURNS TABLE (
  scheme_id TEXT,
  scheme_name TEXT,
  category TEXT,
  state_or_region TEXT,
  scheme_description TEXT,
  scheme_eligibility TEXT,
  keywords TEXT[],
  search_aliases TEXT[],
  intent_tags TEXT[],
  source_url TEXT,
  source_type TEXT,
  verification_status TEXT,
  version INTEGER,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sk.scheme_id,
    sk.scheme_name,
    sk.category,
    sk.state_or_region,
    sk.scheme_description,
    sk.scheme_eligibility,
    sk.keywords,
    sk.search_aliases,
    sk.intent_tags,
    sk.source_url,
    sk.source_type,
    sk.verification_status,
    sk.version,
    (1 - (sk.embedding <=> query_embedding))::FLOAT AS similarity
  FROM public.scheme_knowledge sk
  WHERE sk.embedding IS NOT NULL
    AND (1 - (sk.embedding <=> query_embedding)) >= match_threshold
    AND (filter_category IS NULL OR sk.category = filter_category)
    AND (filter_state_or_region IS NULL OR sk.state_or_region = filter_state_or_region)
    AND (filter_verification_status IS NULL OR sk.verification_status = filter_verification_status)
    AND (filter_scheme_id IS NULL OR sk.scheme_id = filter_scheme_id)
  ORDER BY sk.embedding <=> query_embedding ASC
  LIMIT match_count;
END;
$$;

ALTER TABLE public.scheme_knowledge DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.handoff_requests DISABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO PUBLIC;
GRANT ALL ON ALL TABLES IN SCHEMA public TO PUBLIC;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO PUBLIC;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO PUBLIC;

NOTIFY pgrst, 'reload schema';
SELECT pg_notify('pgrst', 'reload schema');
