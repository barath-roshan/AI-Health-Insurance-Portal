const { classifyIntent, classifyIntentWithContext, classifyIntentWithLLM, extractEntities, normalizeStateName, INTENTS } = require('../intelligence/intentClassifier');
const { semanticSearch } = require('../retrieval/vectorSearch');
const { evaluateAnswerability } = require('../intelligence/answerability');
const { decideNextAction, DECISIONS } = require('../intelligence/decisionEngine');
const { generateGroundedResponse } = require('../generation/llmService');
const { createHandoffRequest } = require('../handoff/handoffService');
const { getOrCreateConversation, saveMessage, getRecentMessageWindow, getConversationState, updateConversationState } = require('./conversationService');
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

  // STEP 1: Get or create conversation memory & active state
  const conv = await getOrCreateConversation(conversationId);
  const activeConvId = conv.conversationId;

  // Save user message
  await saveMessage(activeConvId, 'user', cleanQuery);

  // Get recent conversation history for memory context
  const historyWindow = await getRecentMessageWindow(activeConvId, 6);

  // Retrieve existing state
  const conversationState = getConversationState(activeConvId);

  // Extract structured entities (state, scheme, income, age, relationship)
  const entities = extractEntities(cleanQuery);
  if (entities.state) conversationState.activeState = entities.state;
  if (entities.scheme) conversationState.activeScheme = entities.scheme;
  if (entities.income) conversationState.annualIncome = entities.income;

  // STEP 2: Intent Classification (Context-Aware & LLM Fallback)
  let intent = classifyIntentWithContext(cleanQuery, historyWindow, conversationState);

  // If query is classified as OUT_OF_SCOPE or GENERAL_INFORMATION, try LLM intent classifier for ambiguous queries
  if ((intent === INTENTS.OUT_OF_SCOPE || intent === INTENTS.GENERAL_INFORMATION) && cleanQuery.length > 5) {
    const isExplicitNonHealth = /\b(cook|recipe|biryani|pizza|burger|python|javascript|compiler|weather|cricket|movie)\b/i.test(cleanQuery);
    if (!isExplicitNonHealth) {
      const llmResult = await classifyIntentWithLLM({
        userQuery: cleanQuery,
        conversationHistory: historyWindow,
        conversationState
      });
      if (llmResult && llmResult.intent && INTENTS[llmResult.intent]) {
        intent = llmResult.intent;
        if (llmResult.entities) {
          if (llmResult.entities.state && !conversationState.activeState) conversationState.activeState = llmResult.entities.state;
          if (llmResult.entities.scheme && !conversationState.activeScheme) conversationState.activeScheme = llmResult.entities.scheme;
          if (llmResult.entities.income && !conversationState.annualIncome) conversationState.annualIncome = llmResult.entities.income;
        }
      }
    }
  }

  logger.info(`[RAG PIPELINE] Query: "${cleanQuery}" | Resolved Intent: ${intent}`);

  if (intent !== INTENTS.OUT_OF_SCOPE) {
    conversationState.activeIntent = intent;
  }

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
    updateConversationState(activeConvId, conversationState);

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

    // Diagnostics logging (Requirement 11)
    logger.info('[CHATBOT DIAGNOSTICS]', JSON.stringify({
      current_message: cleanQuery,
      previous_message: historyWindow.length > 1 ? historyWindow[historyWindow.length - 2].content : null,
      previous_intent: conversationState.activeIntent || null,
      conversation_state: conversationState,
      classified_intent: intent,
      retrieval_count: 0,
      answerability: 'N/A',
      decision: DECISIONS.OUT_OF_SCOPE
    }));

    return {
      conversationId: activeConvId,
      decision: DECISIONS.OUT_OF_SCOPE,
      intent,
      answer: outOfScopeAnswer
    };
  }

  // STEP 5 & 6: Vector Retrieval using Hugging Face E5 query embedding
  let searchResults = [];
  let retrievalQuery = cleanQuery;

  // Query enrichment for contextual short queries
  if (cleanQuery.length < 50) {
    const schemeContext = conversationState.activeScheme || '';
    const stateContext = conversationState.activeState || '';
    retrievalQuery = `${schemeContext} ${cleanQuery} ${stateContext} health insurance`.trim();
  }

  const searchOptions = { topK: 5 };
  if (intent === INTENTS.SCHEME_DISCOVERY && conversationState.activeState) {
    searchOptions.stateOrRegion = conversationState.activeState;
  }

  try {
    searchResults = await semanticSearch(retrievalQuery, searchOptions);
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
    conversationContext: { ...conversationState, history: historyWindow }
  });

  logger.info(`[RAG DECISION] Decision: ${decisionResult.decision} | Reason: ${decisionResult.reason}`);

  // Diagnostics logging (Requirement 11)
  logger.info('[CHATBOT DIAGNOSTICS]', JSON.stringify({
    current_message: cleanQuery,
    previous_message: historyWindow.length > 1 ? historyWindow[historyWindow.length - 2].content : null,
    previous_intent: conversationState.activeIntent || null,
    conversation_state: conversationState,
    classified_intent: intent,
    retrieval_count: searchResults.length,
    answerability: evaluation.status,
    decision: decisionResult.decision
  }));

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

      // Clear awaiting state since question was answered
      conversationState.awaiting = [];
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

      if (intent === INTENTS.ELIGIBILITY) {
        conversationState.awaiting = ['state', 'annual_income'];
      }
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

  // STEP 10: Persist updated state & save assistant message
  updateConversationState(activeConvId, conversationState);
  await saveMessage(activeConvId, 'assistant', responsePayload.answer);

  // STEP 11: Return response
  return responsePayload;
}

module.exports = {
  processChat,
  formatRetrievedContext,
  extractSourceMetadata
};
