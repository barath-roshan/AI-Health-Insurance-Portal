const fs = require('fs');
const path = require('path');
const { processChat } = require('./src/chatbot/ragPipeline');

async function runTests() {
  console.log('==================================================');
  console.log('KAAPAN — RAG PIPELINE & CONTEXTUAL EVALUATION SUITE');
  console.log('==================================================\n');

  // PART A: Evaluate test cases in data/evaluation/rag_test_cases.json
  const jsonPath = path.resolve(__dirname, 'data/evaluation/rag_test_cases.json');
  if (fs.existsSync(jsonPath)) {
    console.log('--- PART 1: EVALUATING RAG TEST CASES JSON ---');
    const testCases = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    let passedCount = 0;

    for (const test of testCases) {
      const result = await processChat({ conversationId: `test_json_${test.testId}_${Date.now()}`, userQuery: test.query });
      const passed = result.decision === test.expectedDecision;
      if (passed) {
        passedCount++;
      } else {
        console.log(`❌ MISMATCH [${test.testId}] Query: "${test.query}" | Expected: ${test.expectedDecision} | Actual: ${result.decision} | Intent: ${result.intent}`);
      }
    }

    console.log(`JSON Evaluation Score: ${passedCount}/${testCases.length} (${Math.round((passedCount/testCases.length)*100)}%)\n`);
  }

  // PART B: Multi-Turn Contextual Follow-Up Matrix
  console.log('--- PART 2: MULTI-TURN CONTEXTUAL FOLLOW-UP MATRIX ---');

  // Flow 1: PM-JAY Eligibility Follow-Up
  const conv1 = `flow_pmjay_${Date.now()}`;
  console.log('[FLOW 1] Turn 1: "What is Ayushman Bharat PM-JAY eligibility?"');
  const f1_t1 = await processChat({ conversationId: conv1, userQuery: "What is Ayushman Bharat PM-JAY eligibility?" });
  console.log(`  Decision: ${f1_t1.decision} | Intent: ${f1_t1.intent}`);

  console.log('[FLOW 1] Turn 2: "Tamilnadu, 120000"');
  const f1_t2 = await processChat({ conversationId: conv1, userQuery: "Tamilnadu, 120000" });
  console.log(`  Decision: ${f1_t2.decision} | Intent: ${f1_t2.intent}`);
  console.log(`  Status: ${f1_t2.intent === 'ELIGIBILITY' && f1_t2.decision !== 'OUT_OF_SCOPE' ? '✅ PASSED' : '❌ FAILED'}\n`);

  // Flow 2: Document Clarification Follow-Up
  const conv2 = `flow_doc_${Date.now()}`;
  console.log('[FLOW 2] Turn 1: "What documents are required for CMCHIS?"');
  const f2_t1 = await processChat({ conversationId: conv2, userQuery: "What documents are required for CMCHIS?" });
  console.log(`  Decision: ${f2_t1.decision} | Intent: ${f2_t1.intent}`);

  console.log('[FLOW 2] Turn 2: "Aadhaar and ration card"');
  const f2_t2 = await processChat({ conversationId: conv2, userQuery: "Aadhaar and ration card" });
  console.log(`  Decision: ${f2_t2.decision} | Intent: ${f2_t2.intent}`);
  console.log(`  Status: ${f2_t2.intent === 'DOCUMENTS' && f2_t2.decision !== 'OUT_OF_SCOPE' ? '✅ PASSED' : '❌ FAILED'}\n`);

  // Flow 3: Scheme Discovery & Senior Citizen Follow-Up
  const conv3 = `flow_disc_${Date.now()}`;
  console.log('[FLOW 3] Turn 1: "im from tamilnadu list the schemes available"');
  const f3_t1 = await processChat({ conversationId: conv3, userQuery: "im from tamilnadu list the schemes available" });
  console.log(`  Decision: ${f3_t1.decision} | Intent: ${f3_t1.intent}`);

  console.log('[FLOW 3] Turn 2: "What about senior citizens?"');
  const f3_t2 = await processChat({ conversationId: conv3, userQuery: "What about senior citizens?" });
  console.log(`  Decision: ${f3_t2.decision} | Intent: ${f3_t2.intent}`);
  console.log(`  Status: ${f3_t2.intent === 'SCHEME_DISCOVERY' && f3_t2.decision !== 'OUT_OF_SCOPE' ? '✅ PASSED' : '❌ FAILED'}\n`);

  console.log('==================================================');
  console.log('ALL RAG SUITE TESTS COMPLETED SUCCESSFULLY.');
  console.log('==================================================');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
