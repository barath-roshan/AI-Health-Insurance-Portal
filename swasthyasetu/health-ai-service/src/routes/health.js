const express = require('express');
const router = express.Router();
const { getSupabaseClient } = require('../config/supabase');

/**
 * GET /health
 * Service health check endpoint
 */
router.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';

  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from('scheme_knowledge').select('count').limit(1);
      if (!error) {
        dbStatus = 'connected';
      }
    }
  } catch (err) {
    dbStatus = 'disconnected';
  }

  res.status(200).json({
    status: 'ok',
    service: 'health-ai-service',
    database: 'supabase-postgresql',
    postgresql: dbStatus
  });
});

module.exports = router;
