require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { getSupabaseClient } = require('../src/config/supabase');
const { processChat } = require('../src/chatbot/ragPipeline');
const logger = require('../src/utils/logger');

async function main() {
  try {
    logger.info('==================================================');
    logger.info('TESTING RAG CHATBOT (SUPABASE POSTGRESQL)');
    logger.info('==================================================');

    getSupabaseClient();

    const testCasesPath = path.resolve(__dirname, '../data/evaluation/rag_test_cases.json');
    if (!fs.existsSync(testCasesPath)) {
      throw new Error(`Test cases file not found at: ${testCasesPath}`);
    }

    const testCases = JSON.parse(fs.readFileSync(testCasesPath, 'utf8'));
    logger.info(`Loaded ${testCases.length} RAG chatbot test cases.\n`);

    let passedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const query = tc.query;
      const expectedDecision = tc.expectedDecision;

      console.log('--------------------------------------------------');
      console.log(`[Test ${i + 1}/${testCases.length}] ID: ${tc.testId}`);
      console.log(`QUERY: "${query}"`);
      console.log(`Expected Decision: ${expectedDecision}`);

      const response = await processChat({
        userQuery: query
      });

      console.log(`INTENT:       ${response.intent}`);
      console.log(`DECISION:     ${response.decision}`);
      console.log(`ANSWER:       ${response.answer}`);
      console.log(`SOURCES:      ${JSON.stringify(response.sources || [])}`);
      console.log(`HANDOFF:      ${JSON.stringify(response.handoff || null)}`);

      const isPass = response.decision === expectedDecision;
      if (isPass) {
        console.log('STATUS:       PASS');
        passedCount++;
      } else {
        console.log(`STATUS:       FAIL (Got ${response.decision}, Expected ${expectedDecision})`);
        failedCount++;
      }
      console.log('--------------------------------------------------\n');
    }

    console.log('==================================================');
    console.log('RAG CHATBOT TEST SUMMARY');
    console.log('==================================================');
    console.log(`Total tests: ${testCases.length}`);
    console.log(`Passed:      ${passedCount}`);
    console.log(`Failed:      ${failedCount}`);
    console.log('==================================================\n');

  } catch (error) {
    logger.error('Chat test script failed:', error.message);
    process.exitCode = 1;
  }
}

main();
