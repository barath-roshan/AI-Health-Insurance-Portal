require('dotenv').config();
const express = require('express');
const { getSupabaseClient } = require('./src/config/supabase');
const healthRoutes = require('./src/routes/health');
const chatRoutes = require('./src/routes/chat');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Mount API routes
app.use('/', healthRoutes);
app.use('/api', chatRoutes);

async function startServer() {
  try {
    getSupabaseClient();
    console.log('[DB] Supabase PostgreSQL client initialized');

    app.listen(PORT, () => {
      console.log(`[SERVER] AI service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('[SERVER ERROR] Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
