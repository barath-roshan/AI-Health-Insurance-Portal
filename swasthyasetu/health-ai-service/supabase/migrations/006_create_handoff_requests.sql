-- Migration 006: Create handoff_requests table
CREATE TABLE IF NOT EXISTS handoff_requests (
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

CREATE INDEX IF NOT EXISTS idx_handoff_requests_status ON handoff_requests (status);
