const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

let supabaseInstance = null;

/**
 * In-memory storage mock fallback for local testing when Supabase credentials are placeholders.
 */
class InMemoryDatabaseMock {
  constructor() {
    this.store = {
      scheme_knowledge: [],
      conversations: [],
      messages: [],
      handoff_requests: []
    };
  }

  from(table) {
    if (!this.store[table]) this.store[table] = [];
    const tableData = this.store[table];

    const createQueryChain = (data) => ({
      data,
      error: null,
      eq: (col, val) => createQueryChain(data.filter(r => r[col] === val)),
      limit: (n) => createQueryChain(data.slice(0, n)),
      order: (col, opts) => createQueryChain([...data].sort((a, b) => (opts && opts.ascending) ? (a[col] > b[col] ? 1 : -1) : (a[col] < b[col] ? 1 : -1))),
      single: async () => ({ data: data.length > 0 ? data[0] : null, error: null })
    });

    return {
      select: (fields) => createQueryChain(tableData),
      upsert: async (dataArr, opts = {}) => {
        const rows = Array.isArray(dataArr) ? dataArr : [dataArr];
        rows.forEach(row => {
          const onConflictKey = opts.onConflict || 'scheme_id';
          const idx = tableData.findIndex(r => r[onConflictKey] === row[onConflictKey]);
          if (idx >= 0) {
            tableData[idx] = { ...tableData[idx], ...row, updated_at: new Date() };
          } else {
            tableData.push({ ...row, created_at: new Date(), updated_at: new Date() });
          }
        });
        return { data: rows, error: null };
      },
      insert: async (dataArr) => {
        const rows = Array.isArray(dataArr) ? dataArr : [dataArr];
        rows.forEach(row => tableData.push({ ...row, id: row.id || `mock_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, created_at: new Date(), updated_at: new Date() }));
        return { data: rows[0], error: null };
      },
      update: (dataObj) => ({
        eq: async (col, val) => {
          const idx = tableData.findIndex(r => r[col] === val);
          if (idx >= 0) tableData[idx] = { ...tableData[idx], ...dataObj, updated_at: new Date() };
          return { data: tableData[idx], error: null };
        }
      })
    };
  }

  async rpc(fnName, args) {
    if (fnName === 'match_scheme_chunks') {
      const { query_embedding, match_count = 5, filter_category, filter_state_or_region, filter_verification_status, filter_scheme_id } = args;
      let candidates = this.store.scheme_knowledge.filter(r => Array.isArray(r.embedding));
      
      if (filter_category) candidates = candidates.filter(r => r.category === filter_category);
      if (filter_state_or_region) candidates = candidates.filter(r => r.state_or_region === filter_state_or_region);
      if (filter_verification_status) candidates = candidates.filter(r => r.verification_status === filter_verification_status);
      if (filter_scheme_id) candidates = candidates.filter(r => r.scheme_id === filter_scheme_id);

      const scored = candidates.map(doc => {
        let dotProduct = 0, normA = 0, normB = 0;
        for (let i = 0; i < query_embedding.length; i++) {
          dotProduct += query_embedding[i] * doc.embedding[i];
          normA += query_embedding[i] * query_embedding[i];
          normB += doc.embedding[i] * doc.embedding[i];
        }
        const similarity = (normA === 0 || normB === 0) ? 0 : dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
        return {
          scheme_id: doc.scheme_id,
          scheme_name: doc.scheme_name,
          category: doc.category,
          state_or_region: doc.state_or_region,
          scheme_description: doc.scheme_description,
          scheme_eligibility: doc.scheme_eligibility,
          keywords: doc.keywords,
          search_aliases: doc.search_aliases,
          intent_tags: doc.intent_tags,
          source_url: doc.source_url,
          source_type: doc.source_type,
          verification_status: doc.verification_status,
          version: doc.version,
          similarity
        };
      });

      scored.sort((a, b) => b.similarity - a.similarity);
      return { data: scored.slice(0, match_count), error: null };
    }
    return { data: [], error: null };
  }
}

const mockDB = new InMemoryDatabaseMock();

function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  const keyToUse = serviceRoleKey || anonKey;

  if (!url || !keyToUse || url.includes('your_supabase') || keyToUse.includes('your_supabase')) {
    logger.warn('[SUPABASE NOTICE] SUPABASE_URL / Keys are default placeholders. Using local database store fallback.');
    supabaseInstance = mockDB;
    return supabaseInstance;
  }

  try {
    supabaseInstance = createClient(url, keyToUse, {
      auth: { persistSession: false }
    });
    logger.info('[SUPABASE] Initialized Supabase PostgreSQL client.');
    return supabaseInstance;
  } catch (err) {
    logger.error('[SUPABASE ERROR] Failed to create Supabase client:', err.message);
    supabaseInstance = mockDB;
    return supabaseInstance;
  }
}

module.exports = {
  getSupabaseClient
};
