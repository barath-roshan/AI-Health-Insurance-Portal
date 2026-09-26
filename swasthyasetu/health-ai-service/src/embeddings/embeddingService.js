const { HfInference } = require('@huggingface/inference');
const logger = require('../utils/logger');

const HF_TOKEN = process.env.HF_TOKEN;
const HF_PROVIDER = process.env.HF_PROVIDER || 'deepinfra';
const HF_EMBEDDING_MODEL = process.env.HF_EMBEDDING_MODEL || 'intfloat/multilingual-e5-large';

/**
 * Sleep helper for retry delay
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Extracts a 1D number array (float vector) from various Hugging Face response formats.
 * Supports 1D array [dim], 2D array [1, dim], and 3D array [1, seq_len, dim] via mean pooling.
 * 
 * @param {any} data - Raw payload from Hugging Face Inference API
 * @returns {number[]} 1D float array
 */
function extract1DVector(data) {
  if (!data) {
    throw new Error('[EMBEDDING ERROR] Empty response payload returned from Hugging Face API.');
  }

  // Handle case where API response wraps data in object e.g. { embeddings: [...] } or { feature: [...] }
  if (!Array.isArray(data) && typeof data === 'object') {
    if (Array.isArray(data.embeddings)) data = data.embeddings;
    else if (Array.isArray(data.embedding)) data = data.embedding;
    else if (Array.isArray(data.data)) data = data.data;
  }

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('[EMBEDDING ERROR] Invalid vector format returned from Hugging Face API.');
  }

  // 1D Array: [0.1, 0.2, ...]
  if (typeof data[0] === 'number') {
    return data;
  }

  // 2D Array: [[0.1, 0.2, ...]]
  if (Array.isArray(data[0]) && typeof data[0][0] === 'number') {
    return data[0];
  }

  // 3D Array (token-level embeddings): [[[0.1, 0.2, ...], [0.3, 0.4, ...]]] -> Mean Pooling
  if (Array.isArray(data[0]) && Array.isArray(data[0][0]) && typeof data[0][0][0] === 'number') {
    const tokens = data[0];
    const dim = tokens[0].length;
    const pooled = new Array(dim).fill(0);
    for (let i = 0; i < tokens.length; i++) {
      for (let d = 0; d < dim; d++) {
        pooled[d] += tokens[i][d];
      }
    }
    for (let d = 0; d < dim; d++) {
      pooled[d] /= tokens.length;
    }
    return pooled;
  }

  throw new Error('[EMBEDDING ERROR] Could not extract 1D vector array from response shape.');
}

/**
 * Executes low-level feature extraction request to Hugging Face Inference API via DeepInfra provider.
 * 
 * @param {string} textWithPrefix - Input text string with prefix ("passage: " or "query: ")
 * @param {number} [maxRetries=3] - Max retry attempts for transient network/API failures
 * @returns {Promise<number[]>} Embedding float vector
 */
/**
 * Generates a deterministic 1024-dimensional feature vector from text tokens.
 * ONLY for use in unit tests (TEST_MODE=true).
 * NEVER use in production ingestion — these are not semantic vectors.
 */
function generateDeterministic1024Vector(text) {
  const dim = parseInt(process.env.EMBEDDING_DIMENSIONS) || 1024;
  const vec = new Array(dim).fill(0);
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  
  if (words.length === 0) return vec;

  words.forEach((word, wIdx) => {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dim;
    const weight = 1.0 / Math.sqrt(wIdx + 1);
    vec[idx] += weight;

    for (let i = 0; i < word.length - 1; i++) {
      const biHash = (word.charCodeAt(i) * 31 + word.charCodeAt(i + 1)) % dim;
      vec[biHash] += 0.5 * weight;
    }
  });

  let norm = 0;
  for (let i = 0; i < dim; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dim; i++) vec[i] /= norm;
  }

  return vec;
}

async function callHuggingFaceInference(textWithPrefix, maxRetries = 2) {
  const token = process.env.HF_TOKEN;
  const provider = process.env.HF_PROVIDER || HF_PROVIDER;
  const model = process.env.HF_EMBEDDING_MODEL || HF_EMBEDDING_MODEL;
  const testMode = process.env.TEST_MODE === 'true';

  if (!token || token === 'your_huggingface_token') {
    if (testMode) {
      logger.warn('[HF WARNING] TEST_MODE=true — using deterministic fallback vector (not semantic).');
      return generateDeterministic1024Vector(textWithPrefix);
    }
    throw new Error('[EMBEDDING ERROR] HF_TOKEN is missing or placeholder. Cannot generate real embeddings for production.');
  }

  // Attempt via direct Hugging Face Router API (with provider), then fallback URL
  const routerUrl = `https://router.huggingface.co/${provider}/models/${model}`;
  const hfInferenceUrl = `https://router.huggingface.co/hf-inference/models/${model}`;

  const errors = [];

  for (const targetUrl of [routerUrl, hfInferenceUrl]) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'x-use-cache': 'false'
          },
          body: JSON.stringify({ inputs: textWithPrefix })
        });

        if (res.ok) {
          const responseData = await res.json();
          const vector = extract1DVector(responseData);
          if (Array.isArray(vector) && vector.length > 0) {
            logger.info(`[HF OK] Embedded via ${targetUrl} (dim=${vector.length})`);
            return vector;
          }
          errors.push(`${targetUrl} attempt ${attempt}: empty vector returned`);
        } else if (res.status === 429) {
          // Rate limited — exponential backoff
          const waitMs = Math.pow(2, attempt) * 1000;
          logger.warn(`[HF RATE LIMIT] ${targetUrl} — waiting ${waitMs}ms before retry...`);
          await sleep(waitMs);
          const errorText = await res.text().catch(() => '');
          errors.push(`${targetUrl} attempt ${attempt}: rate limited (${errorText.slice(0, 100)})`);
        } else if (res.status === 503) {
          // Model loading
          const waitMs = 5000;
          logger.warn(`[HF LOADING] ${targetUrl} — model loading, waiting 5s...`);
          await sleep(waitMs);
          errors.push(`${targetUrl} attempt ${attempt}: model loading (503)`);
        } else {
          const errorText = await res.text().catch(() => '');
          errors.push(`${targetUrl} attempt ${attempt}: HTTP ${res.status} — ${errorText.slice(0, 150)}`);
          logger.warn(`[HF ERROR] ${targetUrl} returned status ${res.status}: ${errorText.slice(0, 150)}`);
          break; // Non-retriable error, try next URL
        }
      } catch (err) {
        errors.push(`${targetUrl} attempt ${attempt}: ${err.message}`);
        logger.warn(`[HF NETWORK] Request to ${targetUrl} failed: ${err.message}`);
        if (attempt < maxRetries) await sleep(1000 * attempt);
      }
    }
  }

  if (testMode) {
    logger.error('[HF FAILED] All HF API attempts failed. TEST_MODE=true — using deterministic fallback (NOT semantic).');
    return generateDeterministic1024Vector(textWithPrefix);
  }

  // Production: hard fail — do NOT store fake vectors
  const errorSummary = errors.join(' | ');
  logger.error(`[EMBEDDING ERROR] All HF API attempts failed. Errors: ${errorSummary}`);
  throw new Error(`[EMBEDDING ERROR] Real embedding generation failed. Will not store fake vectors. Errors: ${errorSummary}`);
}

/**
 * Base function to generate vector embedding for an input string.
 * Prepends optional prefix if provided.
 * 
 * @param {string} text - Input text
 * @param {string} [prefix=''] - Optional prefix ("passage: " or "query: ")
 * @returns {Promise<number[]>} Embedding float vector
 */
async function generateEmbedding(text, prefix = '') {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('[EMBEDDING ERROR] Text input must be a non-empty string.');
  }

  const cleanText = text.trim();
  const formattedInput = prefix && !cleanText.startsWith(prefix)
    ? `${prefix}${cleanText}`
    : cleanText;

  return await callHuggingFaceInference(formattedInput);
}

/**
 * Generates document/passage embedding vector.
 * Crucial: Automatically prepends "passage: " according to E5 model convention.
 * 
 * @param {string} text - Document searchable text
 * @returns {Promise<number[]>} Embedding vector for document
 */
async function generateDocumentEmbedding(text) {
  return await generateEmbedding(text, 'passage: ');
}

/**
 * Generates query embedding vector for search query.
 * Crucial: Automatically prepends "query: " according to E5 model convention.
 * 
 * @param {string} query - User search query
 * @returns {Promise<number[]>} Embedding vector for search query
 */
async function generateQueryEmbedding(query) {
  return await generateEmbedding(query, 'query: ');
}

module.exports = {
  generateEmbedding,
  generateDocumentEmbedding,
  generateQueryEmbedding,
  extract1DVector,
  HF_PROVIDER,
  HF_EMBEDDING_MODEL
};
