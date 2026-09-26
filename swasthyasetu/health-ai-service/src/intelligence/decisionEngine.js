const { INTENTS, normalizeStateName, isPersonalizedEligibilityQuery } = require('./intentClassifier');

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

  // RULE 4: Eligibility Handling (General vs Personalized)
  if (intent === INTENTS.ELIGIBILITY) {
    const isPersonal = isPersonalizedEligibilityQuery(userQuery);

    if (isPersonal) {
      const textLower = userQuery.toLowerCase();
      const stateFromQuery = normalizeStateName ? normalizeStateName(userQuery) : null;
      const hasIncomeMention = /\b(income|salary|lakh|rupees|rs|per annum|earning|\d{4,7})\b/i.test(textLower) || (conversationContext && conversationContext.annualIncome);
      const hasStateMention = Boolean(stateFromQuery) || /\b(tamil nadu|kerala|rajasthan|andhra|bihar|assam|delhi|maharashtra|haryana|goa|gujarat|jharkhand|himachal|tn|kl|rj|ap|mh|dl)\b/i.test(textLower) || (conversationContext && conversationContext.activeState);

      if (!hasIncomeMention || !hasStateMention) {
        return {
          decision: DECISIONS.CLARIFY,
          reason: 'Personalized eligibility request missing key citizen profile details (state and annual household income).',
          clarificationQuestion: 'To check your eligibility, could you please specify your state of residence and approximate annual household income?'
        };
      }
    }
  }

  // RULE 3: Evidence clearly missing or irrelevant
  if (retrievalEvaluation.status === 'NOT_ANSWERABLE') {
    return {
      decision: DECISIONS.CLARIFY,
      reason: `Retrieved evidence is insufficient for a grounded answer: ${retrievalEvaluation.reason}`,
      clarificationQuestion: 'I could not find verified scheme details matching your exact query in our database. Could you please specify the state or the exact name of the health insurance scheme you are inquiring about?'
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

  // Safe Fallback (Do NOT route ordinary unhandled path to HUMAN)
  return {
    decision: DECISIONS.CLARIFY,
    reason: 'Safe clarification fallback for unhandled decision path.',
    clarificationQuestion: 'Could you please specify your state or the health scheme name so I can provide accurate details?'
  };
}

module.exports = {
  DECISIONS,
  decideNextAction
};
