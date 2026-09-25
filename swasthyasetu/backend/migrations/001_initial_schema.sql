-- Migration 001: Initial Schema for SwasthyaSetu PostgreSQL Foundation
-- Includes pgvector extension, profiles, schemes, scheme_versions, eligibility_rules, scheme_documents, and scheme_chunks

-- Enable extensions safely
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE,
    full_name TEXT,
    state TEXT,
    district TEXT,
    age INTEGER,
    gender TEXT,
    occupation TEXT,
    annual_income NUMERIC(12, 2),
    family_size INTEGER,
    existing_coverage TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. SCHEMES TABLE
CREATE TABLE IF NOT EXISTS schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_code TEXT UNIQUE NOT NULL,
    scheme_name TEXT NOT NULL,
    category TEXT,
    state_or_region TEXT,
    description TEXT,
    benefits JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'active',
    current_version INTEGER DEFAULT 1,
    source_url TEXT,
    verification_status TEXT DEFAULT 'verified',
    last_verified_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. SCHEME VERSIONS TABLE
CREATE TABLE IF NOT EXISTS scheme_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    eligibility_rules JSONB DEFAULT '[]'::jsonb,
    benefits JSONB DEFAULT '{}'::jsonb,
    documents JSONB DEFAULT '[]'::jsonb,
    application_process JSONB DEFAULT '{}'::jsonb,
    source_url TEXT,
    verification_status TEXT DEFAULT 'verified',
    effective_from TIMESTAMPTZ DEFAULT now(),
    verified_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unq_scheme_version UNIQUE(scheme_id, version)
);

-- 4. ELIGIBILITY RULES TABLE
CREATE TABLE IF NOT EXISTS eligibility_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    operator TEXT NOT NULL, -- Supported operators: =, !=, >, >=, <, <=, IN
    expected_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. SCHEME DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS scheme_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
    document_name TEXT NOT NULL,
    mandatory BOOLEAN DEFAULT true,
    description TEXT
);

-- 6. SCHEME CHUNKS TABLE (pgvector)
-- Dimension default set to 1024 to match intfloat/multilingual-e5-large (Phase 4 embedding model)
CREATE TABLE IF NOT EXISTS scheme_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
    chunk_text TEXT NOT NULL,
    embedding VECTOR(1024),
    source_url TEXT,
    verification_status TEXT DEFAULT 'verified',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_schemes_category ON schemes(category);
CREATE INDEX IF NOT EXISTS idx_schemes_state ON schemes(state_or_region);
CREATE INDEX IF NOT EXISTS idx_schemes_status ON schemes(status);
CREATE INDEX IF NOT EXISTS idx_eligibility_rules_scheme ON eligibility_rules(scheme_id);
CREATE INDEX IF NOT EXISTS idx_scheme_documents_scheme ON scheme_documents(scheme_id);
