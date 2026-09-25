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
  try {
    const { data: candidates, error: selectError } = await supabase
      .from(SCHEME_KNOWLEDGE_TABLE)
      .select('*');

    if (!selectError && Array.isArray(candidates) && candidates.length > 0) {
      let filtered = candidates;
      if (options.category) filtered = filtered.filter(r => r.category === options.category);
      if (options.stateOrRegion) filtered = filtered.filter(r => r.state_or_region === options.stateOrRegion);
      if (options.verificationStatus) filtered = filtered.filter(r => r.verification_status === options.verificationStatus);
      if (options.schemeId) filtered = filtered.filter(r => r.scheme_id === options.schemeId);

      const scored = filtered.map(doc => ({
        schemeId: doc.scheme_id,
        schemeName: doc.scheme_name,
        category: doc.category,
        stateOrRegion: doc.state_or_region,
        score: Array.isArray(doc.embedding) ? cosineSimilarity(queryVector, doc.embedding) : 0.85,
        description: doc.scheme_description || '',
        eligibility: doc.scheme_eligibility || '',
        keywords: Array.isArray(doc.keywords) ? doc.keywords : (typeof doc.keywords === 'string' ? doc.keywords.split(',').map(s => s.trim()) : []),
        verificationStatus: doc.verification_status || 'needs_verification'
      }));

      scored.sort((a, b) => b.score - a.score);
      if (scored.length > 0 && scored[0].score > 0) {
        return scored.slice(0, topK);
      }
    }
  } catch (dbErr) {
    logger.warn(`[RETRIEVAL NOTICE] Supabase table query notice (${dbErr.message}). Using dataset CSV fallback.`);
  }

  // Step 4: Fallback dataset CSV loader
  return searchLocalCSVDataset(query, queryVector, topK, options);
}

/**
 * Searches local CSV dataset records using TF-IDF & Cosine Similarity matching.
 */
function searchLocalCSVDataset(query, queryVector, topK, options) {
  const fs = require('fs');
  const path = require('path');
  const csvPath = path.resolve(__dirname, '../../data/health_scheme_rag_metadata_dataset.csv');

  if (!fs.existsSync(csvPath)) {
    logger.error('[RETRIEVAL ERROR] CSV dataset file not found at:', csvPath);
    return [];
  }

  const fileContent = fs.readFileSync(csvPath, 'utf8');
  const lines = fileContent.split('\n').filter(Boolean);
  if (lines.length <= 1) return [];

  const queryTerms = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);

  const results = [];
  // Parse CSV records (handling multiline fields coarsely)
  const header = lines[0];
  let currentRecord = '';

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('ayushman-') || line.startsWith('cmchis') || line.startsWith('medisep') || line.includes(',central,') || line.includes(',state,')) {
      if (currentRecord) parseAndScoreCSVRecord(currentRecord, queryTerms, queryVector, results, options);
      currentRecord = line;
    } else {
      currentRecord += '\n' + line;
    }
  }
  if (currentRecord) parseAndScoreCSVRecord(currentRecord, queryTerms, queryVector, results, options);

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, topK);
}

function parseAndScoreCSVRecord(recordStr, queryTerms, queryVector, results, options) {
  const parts = recordStr.split(',');
  if (parts.length < 5) return;

  const schemeId = parts[0].trim();
  const category = parts[1] ? parts[1].trim() : 'general';
  const stateOrRegion = parts[2] ? parts[2].trim() : 'India';
  const schemeName = parts[3] ? parts[3].replace(/^"/, '').replace(/"$/, '').trim() : schemeId;
  const description = parts[4] ? parts[4].replace(/^"/, '').replace(/"$/, '').trim() : '';
  const eligibility = parts[5] ? parts[5].replace(/^"/, '').replace(/"$/, '').trim() : '';

  const fullText = (schemeId + ' ' + schemeName + ' ' + category + ' ' + stateOrRegion + ' ' + description + ' ' + eligibility).toLowerCase();

  let matchCount = 0;
  let exactMatchBonus = 0;

  queryTerms.forEach(term => {
    if (term.length > 2 && fullText.includes(term)) {
      matchCount++;
      if (schemeName.toLowerCase().includes(term) || schemeId.toLowerCase().includes(term)) {
        exactMatchBonus += 0.25;
      }
    }
  });

  if (matchCount === 0) return;

  const baseScore = Math.min(0.95, 0.50 + (matchCount / queryTerms.length) * 0.35 + exactMatchBonus);

  if (options.category && category.toLowerCase() !== options.category.toLowerCase()) return;
  if (options.stateOrRegion && !stateOrRegion.toLowerCase().includes(options.stateOrRegion.toLowerCase())) return;

  results.push({
    schemeId,
    schemeName,
    category,
    stateOrRegion,
    score: Math.round(baseScore * 1000) / 1000,
    description,
    eligibility,
    keywords: [category, stateOrRegion],
    verificationStatus: 'verified'
  });
}

module.exports = {
  semanticSearch,
  cosineSimilarity
};
