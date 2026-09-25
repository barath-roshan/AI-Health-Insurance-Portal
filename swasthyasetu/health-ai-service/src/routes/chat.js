const express = require('express');
const router = express.Router();
const { processChat } = require('../chatbot/ragPipeline');
const logger = require('../utils/logger');

/**
 * POST /api/chat
 * Main RAG Chatbot API endpoint
 */
router.post('/chat', async (req, res) => {
  try {
    const { conversationId, message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid request payload. "message" string field is required.'
      });
    }

    const result = await processChat({
      conversationId,
      userQuery: message
    });

    res.status(200).json(result);

  } catch (error) {
    logger.error('[CHAT ROUTE ERROR] Failed to process chat request:', error.message);
    res.status(500).json({
      error: 'An error occurred while processing your request. Please try again later.'
    });
  }
});

module.exports = router;
