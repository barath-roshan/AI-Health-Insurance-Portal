const logger = require('../utils/logger');

const ANSWERABLE_THRESHOLD = parseFloat(process.env.RETRIEVAL_RELEVANT_THRESHOLD) || 0.70;
const UNCERTAIN_THRESHOLD = parseFloat(process.env.RETRIEVAL_UNCERTAIN_THRESHOLD) || 0.50;

/**
 * Evaluates whether retrieved vector search evidence is sufficient to provide a grounded answer.
 * 
 * @param {Object} params
 * @param {string} params.userQuery - Original user query
 * @param {Array<Object>} params.retrievedResults - Retrieved document results from vectorSearch
 * @param {string} params.intent - Classified query intent
 * @returns {{ status: 'ANSWERABLE' | 'UNCERTAIN' | 'NOT_ANSWERABLE', confidence: number, reason: string }}
 */
function evaluateAnswerability({ userQuery, retrievedResults, intent }) {
  if (!Array.isArray(retrievedResults) || retrievedResults.length === 0) {
    return {
      status: 'NOT_ANSWERABLE',
      confidence: 0.95,
      reason: 'Zero matching health scheme records returned from database.'
    };
  }

  const topResult = retrievedResults[0];
  const topScore = typeof topResult.score === 'number' ? topResult.score : 0;
  const secondResult = retrievedResults.length > 1 ? retrievedResults[1] : null;
  const secondScore = secondResult && typeof secondResult.score === 'number' ? secondResult.score : 0;
  const scoreGap = topScore - secondScore;

  // Signal 1: Below minimum score threshold
  if (topScore < UNCERTAIN_THRESHOLD) {
    return {
      status: 'NOT_ANSWERABLE',
      confidence: Math.min(0.95, Math.round((1 - topScore) * 100) / 100),
      reason: `Top similarity score (${topScore.toFixed(3)}) is below minimum relevance threshold (${UNCERTAIN_THRESHOLD}).`
    };
  }

  // Signal 2: Intent-based evaluation rules
  if (intent === 'CLAIM') {
    return {
      status: 'NOT_ANSWERABLE',
      confidence: 0.90,
      reason: 'Claim dispute or hospital rejection requires case-specific human intervention.'
    };
  }

  // Signal 3: Strong single match or multi-scheme match above threshold
  if (topScore >= ANSWERABLE_THRESHOLD) {
    if (retrievedResults.length === 1 || scoreGap >= 0.015 || topScore >= 0.75) {
      return {
        status: 'ANSWERABLE',
        confidence: Math.round(topScore * 100) / 100,
        reason: `Top similarity score (${topScore.toFixed(3)}) strongly exceeds answerability threshold (${ANSWERABLE_THRESHOLD}).`
      };
    } else {
      return {
        status: 'UNCERTAIN',
        confidence: Math.round(topScore * 100) / 100,
        reason: `Multiple schemes share high scores with small gap (${scoreGap.toFixed(3)}).`
      };
    }
  }

  // Signal 4: Score in uncertain zone
  return {
    status: 'UNCERTAIN',
    confidence: Math.round(topScore * 100) / 100,
    reason: `Top score (${topScore.toFixed(3)}) is in uncertain range [${UNCERTAIN_THRESHOLD} - ${ANSWERABLE_THRESHOLD}].`
  };
}

module.exports = {
  evaluateAnswerability,
  ANSWERABLE_THRESHOLD,
  UNCERTAIN_THRESHOLD
};
