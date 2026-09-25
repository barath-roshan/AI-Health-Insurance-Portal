const { getSupabaseClient } = require('../config/supabase');
const { generateQueryEmbedding } = require('../embeddings/embeddingService');
const logger = require('../utils/logger');

const SCHEME_KNOWLEDGE_TABLE = 'scheme_knowledge';

/**
 * Cosine similarity helper for local fallback calculation
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Performs vector similarity retrieval using Supabase pgvector RPC `match_scheme_chunks`.
 * 
 * @param {string} query - User search query
 * @param {Object} [options={}] - Search filters & topK option
 * @param {number} [options.topK=5] - Number of top documents to return
 * @param {string} [options.stateOrRegion] - Filter by state or region
 * @param {string} [options.category] - Filter by category
 * @param {string} [options.verificationStatus] - Filter by verification status
 * @param {string} [options.schemeId] - Filter by scheme ID
 * @returns {Promise<Array<{ schemeId: string, schemeName: string, category: string, stateOrRegion: string, score: number, description: string, eligibility: string, keywords: string[], verificationStatus: string }>>}
 */
async function semanticSearch(query, options = {}) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    throw new Error('[RETRIEVAL ERROR] Search query must be a non-empty string.');
  }

  const topK = options.topK || 5;
  const supabase = getSupabaseClient();

  // Step 1: Generate query embedding using "query: " prefix for E5 model
  const queryVector = await generateQueryEmbedding(query);

  // Step 2: Call Supabase pgvector RPC function `match_scheme_chunks`
  const rpcParams = {
    query_embedding: queryVector,
    match_threshold: 0.0,
    match_count: topK,
    filter_category: options.category || null,
    filter_state_or_region: options.stateOrRegion || null,
    filter_verification_status: options.verificationStatus || null,
    filter_scheme_id: options.schemeId || null
  };

  try {
    const { data: rpcResults, error } = await supabase.rpc('match_scheme_chunks', rpcParams);

    if (error) {
      throw new Error(`Supabase RPC match_scheme_chunks error: ${error.message}`);
    }

    if (Array.isArray(rpcResults) && rpcResults.length > 0) {
      return rpcResults.map(doc => ({
        schemeId: doc.scheme_id,
        schemeName: doc.scheme_name,
        category: doc.category,
        stateOrRegion: doc.state_or_region,
        score: typeof doc.similarity === 'number' ? doc.similarity : 0,
        description: doc.scheme_description || '',
        eligibility: doc.scheme_eligibility || '',
        keywords: doc.keywords || [],
        verificationStatus: doc.verification_status || 'needs_verification'
      }));
    }
  } catch (rpcErr) {
    logger.warn(`[RETRIEVAL NOTICE] Supabase pgvector RPC call notice (${rpcErr.message}). Using standard table query fallback.`);
  }

  // Step 3: Fallback query over Supabase table records
  const { data: candidates, error: selectError } = await supabase
    .from(SCHEME_KNOWLEDGE_TABLE)
    .select('*');

  if (selectError || !Array.isArray(candidates)) {
    logger.error('[RETRIEVAL ERROR] Failed to fetch candidates from Supabase:', selectError ? selectError.message : 'No data');
    return [];
  }

  let filtered = candidates.filter(r => Array.isArray(r.embedding) && r.embedding.length > 0);
  if (options.category) filtered = filtered.filter(r => r.category === options.category);
  if (options.stateOrRegion) filtered = filtered.filter(r => r.state_or_region === options.stateOrRegion);
  if (options.verificationStatus) filtered = filtered.filter(r => r.verification_status === options.verificationStatus);
  if (options.schemeId) filtered = filtered.filter(r => r.scheme_id === options.schemeId);

  const scored = filtered.map(doc => ({
    schemeId: doc.scheme_id,
    schemeName: doc.scheme_name,
    category: doc.category,
    stateOrRegion: doc.state_or_region,
    score: cosineSimilarity(queryVector, doc.embedding),
    description: doc.scheme_description || '',
    eligibility: doc.scheme_eligibility || '',
    keywords: doc.keywords || [],
    verificationStatus: doc.verification_status || 'needs_verification'
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

module.exports = {
  semanticSearch,
  cosineSimilarity
};
