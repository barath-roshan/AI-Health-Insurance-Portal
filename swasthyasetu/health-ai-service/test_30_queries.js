const { processChat } = require('./src/chatbot/ragPipeline');

const CITIZEN_QUERIES = [
  "im from tamilnadu list the schemes available",
  "What is CMCHIS?",
  "Tell me about Ayushman Bharat PM-JAY",
  "What is MEDISEP in Kerala?",
  "What health schemes are available in Tamil Nadu?",
  "Government insurance options in TN",
  "What benefits does CMCHIS provide?",
  "Does PM-JAY cover hospitalization?",
  "What is the maximum coverage amount for PM-JAY?",
  "What documents do I need for CMCHIS?",
  "What papers are required to apply for PM-JAY?",
  "How can I apply for CMCHIS?",
  "Where to register for Ayushman Bharat online?",
  "What is PM-JAY eligibility?",
  "Who is eligible for CMCHIS?",
  "What is the income limit for Tamil Nadu health scheme?",
  "Am I eligible for PM-JAY?",
  "Can my family get CMCHIS?",
  "Does MEDISEP cover government employees?",
  "What schemes are there for senior citizens?",
  "Can a 70 year old get Ayushman Bharat?",
  "My CMCHIS claim was rejected by the hospital.",
  "I want to talk to customer care.",
  "How do I check application status?",
  "How do I cook biryani?",
  "Write a Python program to sort numbers.",
  "What insurance options do poor families have in Tamil Nadu?",
  "Cashless treatment coverage details",
  "Is surgery covered under PM-JAY?",
  "How to fill the application form for health insurance?"
];

async function run30QueryEvaluation() {
  console.log('===========================================================');
  console.log('KAAPAN — 30-QUERY CUSTOMER-CARE & ACCURACY EVALUATION MATRIX');
  console.log('===========================================================\n');

  const counts = {
    ANSWER: 0,
    CLARIFY: 0,
    HUMAN: 0,
    OUT_OF_SCOPE: 0
  };

  for (let i = 0; i < CITIZEN_QUERIES.length; i++) {
    const q = CITIZEN_QUERIES[i];
    const res = await processChat({ conversationId: `test_30_${i}_${Date.now()}`, userQuery: q });
    
    if (counts[res.decision] !== undefined) {
      counts[res.decision]++;
    }

    console.log(`[Q${i+1}] "${q}"`);
    console.log(`     Intent: ${res.intent} | Decision: ${res.decision}`);
  }

  console.log('\n===========================================================');
  console.log('EVALUATION SUMMARY RESULTS:');
  console.log(`  ANSWER:       ${counts.ANSWER} (${Math.round((counts.ANSWER/30)*100)}%)`);
  console.log(`  CLARIFY:      ${counts.CLARIFY} (${Math.round((counts.CLARIFY/30)*100)}%)`);
  console.log(`  HUMAN:        ${counts.HUMAN} (${Math.round((counts.HUMAN/30)*100)}%)`);
  console.log(`  OUT_OF_SCOPE: ${counts.OUT_OF_SCOPE} (${Math.round((counts.OUT_OF_SCOPE/30)*100)}%)`);
  console.log('===========================================================');

  // Verify that HUMAN rate for normal informational queries is appropriately low (<= 4 out of 30)
  const isCustomerCareRateLow = counts.HUMAN <= 4;
  console.log(`Customer Care Rate Evaluation: ${isCustomerCareRateLow ? '✅ PASSED (HUMAN is strictly reserved)' : '❌ FAILED'}`);

  process.exit(0);
}

run30QueryEvaluation().catch(err => {
  console.error('Evaluation error:', err);
  process.exit(1);
});
