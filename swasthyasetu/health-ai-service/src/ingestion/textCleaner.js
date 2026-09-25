/**
 * Clean extracted raw text while preserving essential scheme details, numbers, and paragraph boundaries.
 * @param {string} text - Raw extracted text
 * @returns {string} Cleaned text
 */
function cleanText(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    // Normalize Windows/Mac line endings to standard \n
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')

    // Replace non-breaking spaces and tabs with regular spaces
    .replace(/[\t\f\v]/g, ' ')
    .replace(/\u00A0/g, ' ')

    // Replace 3 or more consecutive newlines with 2 newlines (preserve paragraph boundaries)
    .replace(/\n{3,}/g, '\n\n')

    // Replace multiple horizontal spaces within a single line with a single space
    .split('\n')
    .map(line => line.replace(/[ ]{2,}/g, ' ').trim())
    .join('\n')

    // Final trim of leading/trailing whitespace
    .trim();
}

module.exports = {
  cleanText
};
