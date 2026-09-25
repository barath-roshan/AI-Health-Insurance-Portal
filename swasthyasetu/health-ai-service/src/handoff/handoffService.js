const { getSupabaseClient } = require('../config/supabase');
const logger = require('../utils/logger');

const HANDOFF_TABLE = 'handoff_requests';

function buildHandoffSummary(userQuery, intent, reason) {
  return `User requested assistance regarding "${intent}" for query: "${userQuery}". Reason: ${reason}`;
}

/**
 * Creates and persists a human handoff request in Supabase PostgreSQL table `handoff_requests`.
 * 
 * @param {Object} params
 * @param {string} params.conversationId - Associated conversation ID
 * @param {string} params.userQuery - Citizen query string
 * @param {string} params.intent - Classified intent
 * @param {string} params.reason - Explanation for handoff decision
 * @param {Array<Object>} [params.conversationHistory=[]] - Recent conversation context
 * @param {Array<Object>} [params.retrievedResults=[]] - Top retrieved schemes
 * @returns {Promise<Object>} Created handoff record payload
 */
async function createHandoffRequest({
  conversationId,
  userQuery,
  intent,
  reason,
  conversationHistory = [],
  retrievedResults = []
}) {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  const retrievedSchemes = retrievedResults.map(res => ({
    schemeId: res.schemeId || 'N/A',
    schemeName: res.schemeName || 'N/A',
    category: res.category || 'N/A',
    stateOrRegion: res.stateOrRegion || 'N/A',
    verificationStatus: res.verificationStatus || 'needs_verification'
  }));

  const summary = buildHandoffSummary(userQuery, intent, reason);

  const handoffRow = {
    conversation_id: conversationId || `conv_${Date.now()}`,
    user_query: userQuery,
    intent: intent || 'UNKNOWN',
    reason: reason || 'Case-specific assistance requested.',
    summary,
    retrieved_schemes: retrievedSchemes,
    status: 'PENDING',
    created_at: now,
    updated_at: now
  };

  const { data, error } = await supabase
    .from(HANDOFF_TABLE)
    .insert(handoffRow);

  if (error) {
    logger.warn('[HANDOFF NOTICE] Supabase insert handoff notice:', error.message);
  }

  logger.info(`[HANDOFF CREATED] Conversation ID: ${conversationId} | Reason: ${reason}`);

  return {
    conversationId,
    userQuery,
    intent,
    reason,
    summary,
    retrievedSchemes,
    status: 'PENDING',
    createdAt: now,
    updatedAt: now
  };
}

module.exports = {
  HANDOFF_TABLE,
  createHandoffRequest
};
