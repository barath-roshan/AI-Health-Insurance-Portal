require('dotenv').config();
const { semanticSearch } = require('../src/retrieval/vectorSearch');
const logger = require('../src/utils/logger');

async function main() {
  try {
    logger.info('==================================================');
    logger.info('TESTING SEMANTIC RETRIEVAL (SUPABASE PGVECTOR)');
    logger.info('==================================================');

    const testQuery = process.argv[2] || 'government health insurance in Tamil Nadu';
    logger.info(`Test Query: "${testQuery}"`);

    const results = await semanticSearch(testQuery, { topK: 5 });

    logger.info(`Retrieved ${results.length} result(s):`);
    results.forEach((r, i) => {
      console.log(`\n--- Result ${i + 1} ---`);
      console.log(`Scheme:      ${r.schemeName} (${r.schemeId})`);
      console.log(`Region:      ${r.stateOrRegion}`);
      console.log(`Category:    ${r.category}`);
      console.log(`Similarity:  ${r.score.toFixed(4)}`);
      console.log(`Description: ${r.description.substring(0, 100)}...`);
    });

  } catch (error) {
    logger.error('Semantic retrieval test failed:', error.message);
    process.exitCode = 1;
  }
}

main();
