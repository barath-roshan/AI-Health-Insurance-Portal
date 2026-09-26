const { getSupabaseClient } = require('../config/supabase');
const crypto = require('crypto');
const logger = require('../utils/logger');

const CONVERSATIONS_TABLE = 'conversations';
const MESSAGES_TABLE = 'messages';

/**
 * Retrieves existing conversation or creates a new conversation row in Supabase PostgreSQL.
 * 
 * @param {string} [conversationId] - Optional existing conversation ID
 * @returns {Promise<Object>} Conversation row object
 */
async function getOrCreateConversation(conversationId) {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  if (conversationId) {
    const { data: existing } = await supabase
      .from(CONVERSATIONS_TABLE)
      .select('*')
      .eq('conversation_id', conversationId)
      .single();

    if (existing) {
      return {
        ...existing,
        conversationId: existing.conversation_id
      };
    }
  }

  const newId = conversationId || `conv_${crypto.randomBytes(8).toString('hex')}`;
  const newRow = {
    conversation_id: newId,
    created_at: now,
    updated_at: now
  };

  const { data: inserted, error } = await supabase
    .from(CONVERSATIONS_TABLE)
    .insert(newRow);

  if (error) {
    logger.warn('[CONVERSATION NOTICE] Supabase conversation insert notice:', error.message);
  }

  return { conversation_id: newId, conversationId: newId, id: inserted ? inserted.id : null };
}

/**
 * Appends a message to the messages table in Supabase PostgreSQL.
 * 
 * @param {string} conversationId 
 * @param {'user' | 'assistant'} role 
 * @param {string} content 
 * @param {string} [intent]
 * @param {string} [decision]
 */
async function saveMessage(conversationId, role, content, intent = null, decision = null) {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  // Fetch parent conversation row to get UUID id
  const { data: conv } = await supabase
    .from(CONVERSATIONS_TABLE)
    .select('id')
    .eq('conversation_id', conversationId)
    .single();

  const convUUID = conv ? conv.id : null;

  const messageRow = {
    conversation_id: convUUID,
    role,
    content,
    intent,
    decision,
    created_at: now
  };

  await supabase
    .from(MESSAGES_TABLE)
    .insert(messageRow);

  await supabase
    .from(CONVERSATIONS_TABLE)
    .update({ updated_at: now })
    .eq('conversation_id', conversationId);
}

/**
 * Retrieves recent message window for Groq context construction.
 * 
 * @param {string} conversationId 
 * @param {number} [windowSize=6] 
 * @returns {Promise<Array<{ role: string, content: string }>>}
 */
async function getRecentMessageWindow(conversationId, windowSize = 6) {
  const supabase = getSupabaseClient();

  const { data: conv } = await supabase
    .from(CONVERSATIONS_TABLE)
    .select('id')
    .eq('conversation_id', conversationId)
    .single();

  if (!conv || !conv.id) return [];

  const { data: msgs } = await supabase
    .from(MESSAGES_TABLE)
    .select('role, content')
    .eq('conversation_id', conv.id);

  if (!Array.isArray(msgs)) return [];

  return msgs.slice(-windowSize).map(m => ({
    role: m.role,
    content: m.content
  }));
}

// In-memory conversation state store keyed by conversation_id
const conversationStates = new Map();

/**
 * Gets conversation state context (activeIntent, activeScheme, activeState, awaiting, etc.)
 */
function getConversationState(conversationId) {
  if (!conversationId) return { activeIntent: null, activeScheme: null, activeState: null, awaiting: [] };
  return conversationStates.get(conversationId) || { activeIntent: null, activeScheme: null, activeState: null, awaiting: [] };
}

/**
 * Updates conversation state context
 */
function updateConversationState(conversationId, newState) {
  if (!conversationId) return;
  const current = getConversationState(conversationId);
  const updated = {
    ...current,
    ...newState,
    awaiting: newState.awaiting !== undefined ? newState.awaiting : current.awaiting
  };
  conversationStates.set(conversationId, updated);
}

module.exports = {
  CONVERSATIONS_TABLE,
  MESSAGES_TABLE,
  getOrCreateConversation,
  saveMessage,
  getRecentMessageWindow,
  getConversationState,
  updateConversationState
};
