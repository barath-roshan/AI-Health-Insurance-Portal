require('dotenv').config();
const http = require('http');

async function testHealthEndpoint() {
  console.log('=== TESTING HEALTH ROUTE ===\n');

  const healthRoutes = require('../src/routes/health');
  const express = require('express');
  const app = express();
  app.use('/', healthRoutes);

  const server = app.listen(5099, () => {
    http.get('http://localhost:5099/health', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('[TEST SERVER] GET /health Status Code:', res.statusCode);
        console.log('[TEST SERVER] GET /health Response:', data);
        server.close();
        if (res.statusCode === 200 && data.includes('health-ai-service')) {
          console.log('\n=== HEALTH ROUTE TEST PASSED ===');
          process.exit(0);
        } else {
          console.error('[TEST SERVER ERROR] Unexpected response');
          process.exit(1);
        }
      });
    });
  });
}

testHealthEndpoint().catch(err => {
  console.error('[TEST SERVER ERROR]', err);
  process.exit(1);
});
