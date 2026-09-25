const Groq = require('groq-sdk');
const logger = require('../utils/logger');

const DEFAULT_GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

let client = null;

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    throw new Error('[GROQ ERROR] GROQ_API_KEY environment variable is not set properly in .env');
  }

  if (!client) {
    client = new Groq({ apiKey });
  }

  return client;
}

module.exports = {
  getGroqClient,
  DEFAULT_GROQ_MODEL
};
