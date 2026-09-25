/**
 * Intelligent section-aware chunking for government scheme documents.
 * Standard token approximation: ~4 characters per token.
 * Default chunk size: 600 tokens (~2400 chars).
 * Default overlap: 75 tokens (~300 chars).
 */

const DEFAULT_OPTIONS = {
  maxChunkChars: 2400, // ~600 tokens
  overlapChars: 300,   // ~75 tokens
  minChunkChars: 100   // Filter out tiny residual fragments
};

/**
 * Detect section titles (e.g., "1. Eligibility", "ELIGIBILITY CRITERIA", "Benefits:")
 */
function extractSectionTitle(text) {
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      /^(SECTION|\d+\.|\d+\)|\b[A-Z\s]{4,}\b|Eligibility|Benefits|Documents|Application Procedure|Coverage|Overview)/i.test(trimmed) &&
      trimmed.length < 100
    ) {
      return trimmed;
    }
  }
  return null;
}

/**
 * Split text into semantic chunks with section awareness and overlap.
 * @param {string} text - Cleaned document text
 * @param {object} options - Options for maxChunkChars, overlapChars
 * @returns {Array<{ chunkIndex: number, content: string, sectionTitle: string|null }>}
 */
function createChunks(text, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  if (!text || typeof text !== 'string') {
    return [];
  }

  // Split by double newlines to keep paragraphs intact
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

  const chunks = [];
  let currentChunkText = '';
  let currentSectionTitle = null;
  let chunkIndex = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i].trim();
    const detectedTitle = extractSectionTitle(para);
    if (detectedTitle) {
      currentSectionTitle = detectedTitle;
    }

    // If adding this paragraph exceeds maxChunkChars and currentChunkText is not empty
    if (currentChunkText.length + para.length + 2 > opts.maxChunkChars && currentChunkText.length >= opts.minChunkChars) {
      // Save current chunk
      chunks.push({
        chunkIndex: chunkIndex++,
        content: currentChunkText.trim(),
        sectionTitle: currentSectionTitle
      });

      // Prepare overlap for next chunk
      const overlapStart = Math.max(0, currentChunkText.length - opts.overlapChars);
      const overlapText = currentChunkText.substring(overlapStart).trim();

      // Start new chunk with overlap + current paragraph
      currentChunkText = overlapText ? `${overlapText}\n\n${para}` : para;
    } else {
      // Append paragraph to current chunk
      if (currentChunkText.length > 0) {
        currentChunkText += '\n\n' + para;
      } else {
        currentChunkText = para;
      }
    }
  }

  // Add final remaining chunk if non-empty
  if (currentChunkText.trim().length >= opts.minChunkChars) {
    chunks.push({
      chunkIndex: chunkIndex++,
      content: currentChunkText.trim(),
      sectionTitle: currentSectionTitle
    });
  }

  return chunks;
}

module.exports = {
  createChunks,
  DEFAULT_OPTIONS
};
