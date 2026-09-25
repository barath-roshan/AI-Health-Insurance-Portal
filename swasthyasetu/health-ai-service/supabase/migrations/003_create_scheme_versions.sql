-- Migration 003: Create scheme_versions table
CREATE TABLE IF NOT EXISTS scheme_versions (
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

CREATE INDEX IF NOT EXISTS idx_scheme_versions_lookup 
ON scheme_versions (scheme_id, version);
