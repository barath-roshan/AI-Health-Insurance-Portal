/**
 * Retrieval Evaluator module.
 * Evaluates semantic search results to determine confidence status:
 * RELEVANT, UNCERTAIN, or IRRELEVANT.
 */

const RELEVANT_THRESHOLD = parseFloat(process.env.RETRIEVAL_RELEVANT_THRESHOLD) || 0.70;
const UNCERTAIN_THRESHOLD = parseFloat(process.env.RETRIEVAL_UNCERTAIN_THRESHOLD) || 0.50;

/**
 * Evaluates semantic search results against configured threshold heuristics.
 * 
 * @param {Array<{ score: number, schemeId: string, schemeName: string }>} searchResults - Array of retrieved documents
 * @param {Object} [options={}] - Additional metadata options
 * @returns {{ status: 'RELEVANT' | 'UNCERTAIN' | 'IRRELEVANT', confidence: number, reason: string }}
 */
function evaluateRetrieval(searchResults, options = {}) {
  if (!Array.isArray(searchResults) || searchResults.length === 0) {
    return {
      status: 'IRRELEVANT',
      confidence: 0.95,
      reason: 'No scheme documents returned from vector search.'
    };
  }

  const topResult = searchResults[0];
  const topScore = typeof topResult.score === 'number' ? topResult.score : 0;
  const secondResult = searchResults.length > 1 ? searchResults[1] : null;
  const secondScore = secondResult && typeof secondResult.score === 'number' ? secondResult.score : 0;
  const scoreGap = topScore - secondScore;

  const meaningfulResults = searchResults.filter(r => (r.score || 0) >= UNCERTAIN_THRESHOLD);

  // Case 1: Below uncertain threshold
  if (topScore < UNCERTAIN_THRESHOLD) {
    return {
      status: 'IRRELEVANT',
      confidence: Math.min(0.95, Math.round((1.0 - topScore) * 100) / 100),
      reason: `Top score (${topScore.toFixed(3)}) is below uncertain threshold (${UNCERTAIN_THRESHOLD}).`
    };
  }

  // Case 2: Above relevant threshold
  if (topScore >= RELEVANT_THRESHOLD) {
    // Check if clear top match exists or multiple strong matches
    if (searchResults.length === 1 || scoreGap >= 0.015 || topScore >= 0.75) {
      return {
        status: 'RELEVANT',
        confidence: Math.round(topScore * 100) / 100,
        reason: `Top similarity score (${topScore.toFixed(3)}) exceeds relevant threshold (${RELEVANT_THRESHOLD}).`
      };
    } else {
      return {
        status: 'UNCERTAIN',
        confidence: Math.round(topScore * 100) / 100,
        reason: `Multiple schemes share nearly identical top scores (top score: ${topScore.toFixed(3)}, gap: ${scoreGap.toFixed(3)}).`
      };
    }
  }

  // Case 3: Between uncertain and relevant threshold
  return {
    status: 'UNCERTAIN',
    confidence: Math.round(topScore * 100) / 100,
    reason: `Top similarity score (${topScore.toFixed(3)}) falls between uncertain (${UNCERTAIN_THRESHOLD}) and relevant (${RELEVANT_THRESHOLD}) thresholds.`
  };
}

module.exports = {
  evaluateRetrieval,
  RELEVANT_THRESHOLD,
  UNCERTAIN_THRESHOLD
};
