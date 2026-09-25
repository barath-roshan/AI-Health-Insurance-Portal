-- Migration 007: Create RPC function for pgvector similarity search
CREATE OR REPLACE FUNCTION match_scheme_chunks (
  query_embedding VECTOR(1024),
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
  FROM scheme_knowledge sk
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
