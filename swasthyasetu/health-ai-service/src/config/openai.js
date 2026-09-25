const OpenAI = require('openai');

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    throw new Error('[OPENAI ERROR] OPENAI_API_KEY environment variable is not set properly in .env');
  }

  return new OpenAI({
    apiKey: apiKey
  });
}

module.exports = {
  getOpenAIClient
};
