const { processChat } = require('./src/chatbot/ragPipeline');
const { classifyIntentWithContext, extractEntities } = require('./src/intelligence/intentClassifier');

async function runRegressionSuite() {
  console.log('===========================================================');
  console.log('KAAPAN — OFFICIAL CRITICAL RAG REGRESSION TEST SUITE');
  console.log('===========================================================\n');

  let passedCount = 0;
  const totalTests = 10;

  // TEST_REGRESSION_001
  console.log('[TEST_REGRESSION_001] Input: "im from tamilnadu list the schemes available"');
  const res1 = await processChat({ conversationId: `reg_001_${Date.now()}`, userQuery: "im from tamilnadu list the schemes available" });
  const pass1 = res1.intent === 'SCHEME_DISCOVERY' && res1.decision === 'ANSWER';
  console.log(`  Intent: ${res1.intent} | Decision: ${res1.decision} | ${pass1 ? '✅ PASSED' : '❌ FAILED'}\n`);
  if (pass1) passedCount++;

  // TEST_REGRESSION_002
  console.log('[TEST_REGRESSION_002] Multi-turn Follow-up: "What is PM-JAY eligibility?" -> "Tamilnadu, 120000"');
  const conv2 = `reg_002_${Date.now()}`;
  await processChat({ conversationId: conv2, userQuery: "What is PM-JAY eligibility?" });
  const res2 = await processChat({ conversationId: conv2, userQuery: "Tamilnadu, 120000" });
  const pass2 = res2.intent !== 'OUT_OF_SCOPE' && res2.decision !== 'OUT_OF_SCOPE';
  console.log(`  Follow-up Intent: ${res2.intent} | Decision: ${res2.decision} | ${pass2 ? '✅ PASSED' : '❌ FAILED'}\n`);
  if (pass2) passedCount++;

  // TEST_REGRESSION_003
  console.log('[TEST_REGRESSION_003] Input: "What is PM-JAY eligibility?" (General Eligibility Inquire)');
  const res3 = await processChat({ conversationId: `reg_003_${Date.now()}`, userQuery: "What is PM-JAY eligibility?" });
  const pass3 = res3.decision === 'ANSWER' || res3.decision === 'CLARIFY';
  console.log(`  Intent: ${res3.intent} | Decision: ${res3.decision} | ${pass3 ? '✅ PASSED' : '❌ FAILED'}\n`);
  if (pass3) passedCount++;

  // TEST_REGRESSION_004
  console.log('[TEST_REGRESSION_004] Input: "Am I eligible for PM-JAY?" (Personalized Eligibility)');
  const res4 = await processChat({ conversationId: `reg_004_${Date.now()}`, userQuery: "Am I eligible for PM-JAY?" });
  const pass4 = res4.intent === 'ELIGIBILITY' && res4.decision === 'CLARIFY';
  console.log(`  Intent: ${res4.intent} | Decision: ${res4.decision} | ${pass4 ? '✅ PASSED' : '❌ FAILED'}\n`);
  if (pass4) passedCount++;

  // TEST_REGRESSION_005
  console.log('[TEST_REGRESSION_005] Input: "What documents do I need?"');
  const res5 = await processChat({ conversationId: `reg_005_${Date.now()}`, userQuery: "What documents do I need?" });
  const pass5 = res5.intent === 'DOCUMENTS';
  console.log(`  Intent: ${res5.intent} | Decision: ${res5.decision} | ${pass5 ? '✅ PASSED' : '❌ FAILED'}\n`);
  if (pass5) passedCount++;

  // TEST_REGRESSION_006
  console.log('[TEST_REGRESSION_006] Input: "I want to talk to a human"');
  const res6 = await processChat({ conversationId: `reg_006_${Date.now()}`, userQuery: "I want to talk to a human" });
  const pass6 = res6.intent === 'HUMAN_REQUEST' && res6.decision === 'HUMAN';
  console.log(`  Intent: ${res6.intent} | Decision: ${res6.decision} | ${pass6 ? '✅ PASSED' : '❌ FAILED'}\n`);
  if (pass6) passedCount++;

  // TEST_REGRESSION_007
  console.log('[TEST_REGRESSION_007] Input: "My claim was rejected"');
  const res7 = await processChat({ conversationId: `reg_007_${Date.now()}`, userQuery: "My claim was rejected" });
  const pass7 = res7.intent === 'CLAIM' && res7.decision === 'HUMAN';
  console.log(`  Intent: ${res7.intent} | Decision: ${res7.decision} | ${pass7 ? '✅ PASSED' : '❌ FAILED'}\n`);
  if (pass7) passedCount++;

  // TEST_REGRESSION_008
  console.log('[TEST_REGRESSION_008] Input: "How do I cook biryani?"');
  const res8 = await processChat({ conversationId: `reg_008_${Date.now()}`, userQuery: "How do I cook biryani?" });
  const pass8 = res8.intent === 'OUT_OF_SCOPE' && res8.decision === 'OUT_OF_SCOPE';
  console.log(`  Intent: ${res8.intent} | Decision: ${res8.decision} | ${pass8 ? '✅ PASSED' : '❌ FAILED'}\n`);
  if (pass8) passedCount++;

  // TEST_REGRESSION_009
  console.log('[TEST_REGRESSION_009] Input: "What benefits does CMCHIS provide?"');
  const res9 = await processChat({ conversationId: `reg_009_${Date.now()}`, userQuery: "What benefits does CMCHIS provide?" });
  const pass9 = res9.intent === 'BENEFITS' && res9.decision === 'ANSWER';
  console.log(`  Intent: ${res9.intent} | Decision: ${res9.decision} | ${pass9 ? '✅ PASSED' : '❌ FAILED'}\n`);
  if (pass9) passedCount++;

  // TEST_REGRESSION_010
  console.log('[TEST_REGRESSION_010] Input: "How can I apply for PM-JAY?"');
  const res10 = await processChat({ conversationId: `reg_010_${Date.now()}`, userQuery: "How can I apply for PM-JAY?" });
  const pass10 = res10.intent === 'APPLICATION' && res10.decision === 'ANSWER';
  console.log(`  Intent: ${res10.intent} | Decision: ${res10.decision} | ${pass10 ? '✅ PASSED' : '❌ FAILED'}\n`);
  if (pass10) passedCount++;

  console.log('===========================================================');
  console.log(`REGRESSION SUITE RESULT: ${passedCount}/${totalTests} PASSED (${Math.round((passedCount/totalTests)*100)}%)`);
  console.log('===========================================================');

  if (passedCount === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runRegressionSuite().catch(err => {
  console.error('Regression suite runtime error:', err);
  process.exit(1);
});
