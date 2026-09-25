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
async function callHuggingFaceInference(textWithPrefix, maxRetries = 3) {
  const token = process.env.HF_TOKEN;
  const provider = process.env.HF_PROVIDER || HF_PROVIDER;
  const model = process.env.HF_EMBEDDING_MODEL || HF_EMBEDDING_MODEL;

  if (!token || token === 'your_huggingface_token') {
    throw new Error('[HF ERROR] HF_TOKEN environment variable is missing or invalid in .env');
  }

  let attempt = 0;
  let delay = 1000;

  // Primary Router URL (Hugging Face Inference Router with DeepInfra provider)
  const routerUrl = `https://router.huggingface.co/${provider}/models/${model}`;
  // Fallback API URL (Hugging Face Standard Inference API)
  const fallbackUrl = `https://api-inference.huggingface.co/models/${model}`;

  while (attempt <= maxRetries) {
    try {
      // Attempt via direct Hugging Face Router API (with deepinfra provider)
      let res = await fetch(routerUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-use-cache': 'false'
        },
        body: JSON.stringify({ inputs: textWithPrefix })
      });

      // Fallback to standard inference API if router endpoint is unavailable
      if (!res.ok && res.status === 404) {
        res = await fetch(fallbackUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'x-use-cache': 'false'
          },
          body: JSON.stringify({ inputs: textWithPrefix })
        });
      }

      if (!res.ok) {
        const errorText = await res.text();
        let errMsg = `Hugging Face API returned status ${res.status}: ${res.statusText}`;
        try {
          const errObj = JSON.parse(errorText);
          if (errObj.error) errMsg = `Hugging Face API Error: ${errObj.error}`;
        } catch (_) {}
        
        const isTransient = res.status === 429 || res.status >= 500;
        if (isTransient && attempt < maxRetries) {
          attempt++;
          logger.warn(`[HF RETRY] Attempt ${attempt}/${maxRetries} failed (${errMsg}). Retrying in ${delay}ms...`);
          await sleep(delay);
          delay *= 2;
          continue;
        }
        throw new Error(errMsg);
      }

      const responseData = await res.json();
      const vector = extract1DVector(responseData);

      if (!Array.isArray(vector) || vector.length === 0 || typeof vector[0] !== 'number') {
        throw new Error('[HF ERROR] Returned vector is empty or contains non-numeric values.');
      }

      return vector;

    } catch (error) {
      if (attempt < maxRetries && (error.code === 'ETIMEDOUT' || error.message.includes('fetch failed'))) {
        attempt++;
        logger.warn(`[HF RETRY] Transient error on attempt ${attempt}/${maxRetries} (${error.message}). Retrying in ${delay}ms...`);
        await sleep(delay);
        delay *= 2;
        continue;
      }
      logger.error(`[HF ERROR] Feature extraction failed after ${attempt + 1} attempt(s):`, error.message);
      throw error;
    }
  }
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
