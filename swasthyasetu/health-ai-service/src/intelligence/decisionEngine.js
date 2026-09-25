const { INTENTS } = require('./intentClassifier');

const DECISIONS = {
  ANSWER: 'ANSWER',
  CLARIFY: 'CLARIFY',
  HUMAN: 'HUMAN',
  OUT_OF_SCOPE: 'OUT_OF_SCOPE'
};

/**
 * Deterministic Decision Engine determining next copilot action:
 * ANSWER, CLARIFY, HUMAN, or OUT_OF_SCOPE.
 * 
 * @param {Object} params
 * @param {string} params.userQuery - User input message
 * @param {string} params.intent - Classified intent
 * @param {Object} params.retrievalEvaluation - Output from evaluateAnswerability
 * @param {Object} [params.conversationContext] - Ongoing conversation memory context
 * @returns {{ decision: string, reason: string, clarificationQuestion?: string }}
 */
function decideNextAction({ userQuery, intent, retrievalEvaluation, conversationContext }) {
  // RULE 1: User explicitly asks for human assistance
  if (intent === INTENTS.HUMAN_REQUEST) {
    return {
      decision: DECISIONS.HUMAN,
      reason: 'User explicitly requested human customer care assistance.'
    };
  }

  // RULE 2: Domain out-of-scope filter
  if (intent === INTENTS.OUT_OF_SCOPE) {
    return {
      decision: DECISIONS.OUT_OF_SCOPE,
      reason: 'Query is outside government health insurance domain.'
    };
  }

  // RULE 6: Personal claim disputes or hospital rejections
  if (intent === INTENTS.CLAIM) {
    return {
      decision: DECISIONS.HUMAN,
      reason: 'Case-specific claim dispute or hospital rejection requires human customer care intervention.'
    };
  }

  // RULE 7: Private system access required (e.g. status tracking)
  if (intent === INTENTS.STATUS) {
    return {
      decision: DECISIONS.HUMAN,
      reason: 'Application or card status tracking requires direct access to private government databases.'
    };
  }

  // RULE 4: Personalized eligibility safety check
  // RAG chatbot does NOT make eligibility decisions!
  if (intent === INTENTS.ELIGIBILITY) {
    const textLower = userQuery.toLowerCase();
    const hasIncomeMention = /\b(income|salary|lakh|rupees|rs|per annum|earning)\b/i.test(textLower);
    const hasStateMention = /\b(tamil nadu|kerala|rajasthan|andhra|bihar|assam|delhi|maharashtra|haryana|goa|gujarat|jharkhand|himachal)\b/i.test(textLower);

    if (!hasIncomeMention || !hasStateMention) {
      return {
        decision: DECISIONS.CLARIFY,
        reason: 'Personalized eligibility request missing key citizen profile details (state and annual household income).',
        clarificationQuestion: 'To check your eligibility, could you please specify your state of residence and approximate annual household income?'
      };
    }
  }

  // RULE 3: Evidence clearly missing or irrelevant
  if (retrievalEvaluation.status === 'NOT_ANSWERABLE') {
    return {
      decision: DECISIONS.HUMAN,
      reason: `Retrieved evidence is insufficient to formulate a grounded answer: ${retrievalEvaluation.reason}`
    };
  }

  // RULE 8: Ambiguous evidence in uncertain range
  if (retrievalEvaluation.status === 'UNCERTAIN') {
    return {
      decision: DECISIONS.CLARIFY,
      reason: 'Retrieved evidence has ambiguous similarity matches.',
      clarificationQuestion: 'Could you please specify which state or specific health insurance scheme you are inquiring about?'
    };
  }

  // RULE 5: Evidence is relevant and sufficient
  if (retrievalEvaluation.status === 'ANSWERABLE') {
    return {
      decision: DECISIONS.ANSWER,
      reason: 'Retrieved evidence is highly relevant and sufficient for a grounded response.'
    };
  }

  // Fallback
  return {
    decision: DECISIONS.HUMAN,
    reason: 'Default safety fallback for unhandled decision path.'
  };
}

module.exports = {
  DECISIONS,
  decideNextAction
};
