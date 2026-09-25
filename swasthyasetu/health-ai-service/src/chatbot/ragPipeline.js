const { classifyIntent, INTENTS } = require('../intelligence/intentClassifier');
const { semanticSearch } = require('../retrieval/vectorSearch');
const { evaluateAnswerability } = require('../intelligence/answerability');
const { decideNextAction, DECISIONS } = require('../intelligence/decisionEngine');
const { generateGroundedResponse } = require('../generation/llmService');
const { createHandoffRequest } = require('../handoff/handoffService');
const { getOrCreateConversation, saveMessage, getRecentMessageWindow } = require('./conversationService');
const logger = require('../utils/logger');

const UNVERIFIED_DISCLAIMER = 'This information is from the current knowledge base and should be verified against the latest official government source.';

/**
 * Formats retrieved scheme documents into compact text context for Groq LLM prompt.
 * Strictly excludes raw embeddings, database ObjectIDs, and internal similarity scores.
 */
function formatRetrievedContext(retrievedResults) {
  if (!Array.isArray(retrievedResults) || retrievedResults.length === 0) {
    return 'No relevant health scheme context available.';
  }

  return retrievedResults.map((res, i) => {
    return `
--- SOURCE ${i + 1} ---
Scheme Name: ${res.schemeName || 'N/A'} (ID: ${res.schemeId || 'N/A'})
Region: ${res.stateOrRegion || 'N/A'}
Category: ${res.category || 'N/A'}
Description: ${res.description || 'N/A'}
Eligibility Summary: ${res.eligibility || 'N/A'}
Keywords: ${Array.isArray(res.keywords) ? res.keywords.join(', ') : 'N/A'}
Verification Status: ${res.verificationStatus || 'needs_verification'}
`.trim();
  }).join('\n\n');
}

/**
 * Extracts clean source metadata array from retrieved results.
 */
function extractSourceMetadata(retrievedResults) {
  if (!Array.isArray(retrievedResults)) return [];
  return retrievedResults.map(res => ({
    schemeName: res.schemeName || 'N/A',
    sourceUrl: res.sourceUrl || '',
    verificationStatus: res.verificationStatus || 'needs_verification'
  }));
}

/**
 * End-to-end RAG Chat Pipeline Controller.
 * 
 * @param {Object} params
 * @param {string} [params.conversationId] - Optional existing conversation ID
 * @param {string} params.userQuery - Citizen input message
 * @returns {Promise<Object>} Processed API response payload
 */
async function processChat({ conversationId, userQuery }) {
  if (!userQuery || typeof userQuery !== 'string' || userQuery.trim().length === 0) {
    throw new Error('[RAG PIPELINE ERROR] User query message must be a non-empty string.');
  }

  const cleanQuery = userQuery.trim();

  // STEP 1: Get or create conversation memory
  const conv = await getOrCreateConversation(conversationId);
  const activeConvId = conv.conversationId;

  // Save user message
  await saveMessage(activeConvId, 'user', cleanQuery);

  // Get recent conversation history for memory context
  const historyWindow = await getRecentMessageWindow(activeConvId, 6);

  // STEP 2: Intent Classification
  const intent = classifyIntent(cleanQuery);
  logger.info(`[RAG PIPELINE] Query: "${cleanQuery}" | Intent: ${intent}`);

  // STEP 3: Handle explicit Human Request intent immediately
  if (intent === INTENTS.HUMAN_REQUEST) {
    const handoff = await createHandoffRequest({
      conversationId: activeConvId,
      userQuery: cleanQuery,
      intent,
      reason: 'User explicitly requested customer care assistance.',
      conversationHistory: historyWindow,
      retrievedResults: []
    });

    const assistantAnswer = 'I am transferring your request to customer care for personalized human assistance.';
    await saveMessage(activeConvId, 'assistant', assistantAnswer);

    return {
      conversationId: activeConvId,
      decision: DECISIONS.HUMAN,
      intent,
      answer: assistantAnswer,
      handoff: {
        status: handoff.status,
        reason: handoff.reason
      }
    };
  }

  // STEP 4: Handle Out-of-Scope queries immediately without consuming retrieval/LLM resources
  if (intent === INTENTS.OUT_OF_SCOPE) {
    const outOfScopeAnswer = 'I am specialized in Indian government health insurance schemes, eligibility, coverage benefits, documents, and application procedures. How can I help you with government health schemes today?';
    await saveMessage(activeConvId, 'assistant', outOfScopeAnswer);

    return {
      conversationId: activeConvId,
      decision: DECISIONS.OUT_OF_SCOPE,
      intent,
      answer: outOfScopeAnswer
    };
  }

  // STEP 5 & 6: Vector Retrieval using Hugging Face E5 query embedding
  let searchResults = [];
  try {
    searchResults = await semanticSearch(cleanQuery, { topK: 5 });
  } catch (searchErr) {
    logger.error('[RAG PIPELINE] Semantic search failed:', searchErr.message);
  }

  // STEP 7: Answerability Evaluation
  const evaluation = evaluateAnswerability({
    userQuery: cleanQuery,
    retrievedResults: searchResults,
    intent
  });

  // STEP 8: Decision Engine Execution
  const decisionResult = decideNextAction({
    userQuery: cleanQuery,
    intent,
    retrievalEvaluation: evaluation,
    conversationContext: historyWindow
  });

  logger.info(`[RAG DECISION] Decision: ${decisionResult.decision} | Reason: ${decisionResult.reason}`);

  let responsePayload = {};

  // STEP 9: Action Branch Handling
  switch (decisionResult.decision) {
    case DECISIONS.ANSWER: {
      const compactContext = formatRetrievedContext(searchResults);
      const llmOutput = await generateGroundedResponse({
        userQuery: cleanQuery,
        context: compactContext,
        conversationHistory: historyWindow
      });

      let finalAnswerText = llmOutput.answer || 'Information retrieved.';
      
      // If any retrieved scheme needs verification, append notice
      const hasUnverified = searchResults.some(r => r.verificationStatus === 'needs_verification');
      if (hasUnverified && !finalAnswerText.includes('verified against')) {
        finalAnswerText += `\n\n*Note: ${UNVERIFIED_DISCLAIMER}*`;
      }

      const sources = extractSourceMetadata(searchResults);

      responsePayload = {
        conversationId: activeConvId,
        decision: DECISIONS.ANSWER,
        intent,
        answer: finalAnswerText,
        sources
      };
      break;
    }

    case DECISIONS.CLARIFY: {
      const clarifyAnswer = decisionResult.clarificationQuestion || 'Could you please specify your state of residence and income details to help check applicable schemes?';
      responsePayload = {
        conversationId: activeConvId,
        decision: DECISIONS.CLARIFY,
        intent,
        answer: clarifyAnswer
      };
      break;
    }

    case DECISIONS.HUMAN:
    default: {
      const handoff = await createHandoffRequest({
        conversationId: activeConvId,
        userQuery: cleanQuery,
        intent,
        reason: decisionResult.reason,
        conversationHistory: historyWindow,
        retrievedResults: searchResults
      });

      const humanAnswer = 'This request requires case-specific support or official system verification. I have prepared your conversation context for our customer care team.';
      responsePayload = {
        conversationId: activeConvId,
        decision: DECISIONS.HUMAN,
        intent,
        answer: humanAnswer,
        handoff: {
          status: handoff.status,
          reason: handoff.reason
        }
      };
      break;
    }
  }

  // STEP 10: Save assistant message in conversation memory
  await saveMessage(activeConvId, 'assistant', responsePayload.answer);

  // STEP 11: Return response
  return responsePayload;
}

module.exports = {
  processChat,
  formatRetrievedContext,
  extractSourceMetadata
};
