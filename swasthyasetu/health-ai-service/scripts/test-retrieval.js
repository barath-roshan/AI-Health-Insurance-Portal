require('dotenv').config();
const { connectMongoDB, closeMongoDB } = require('../src/config/mongodb');
const { generateEmbedding } = require('../src/embeddings/embeddingService');
const { searchKnowledge } = require('../src/retrieval/vectorSearch');

async function runRetrievalTest() {
  const query = process.argv[2] || 'What documents are required for this scheme?';

  console.log('[DB] Connecting to MongoDB...');
  try {
    await connectMongoDB();

    console.log(`\n[RETRIEVAL] Test Query: "${query}"`);
    console.log('[RETRIEVAL] Generating query embedding...');
    const queryEmbedding = await generateEmbedding(query);

    console.log('[RETRIEVAL] Executing vector search...');
    const results = await searchKnowledge(queryEmbedding, {
      topK: 5,
      schemeId: 'cmchis'
    });

    console.log(`\n[RETRIEVAL] Found ${results.length} result(s):\n`);

    if (results.length === 0) {
      console.log('No matching chunks found in the database. Ensure documents are ingested first.');
    } else {
      results.forEach((res, index) => {
        console.log(`--- Result ${index + 1} ---`);
        console.log(`Score: ${res.score !== undefined ? res.score.toFixed(4) : 'N/A'}`);
        console.log(`Scheme: ${res.schemeId}`);
        console.log(`Document: ${res.documentName}`);
        console.log(`Chunk Index: ${res.chunkIndex}`);
        console.log(`Section: ${res.metadata?.sectionTitle || 'N/A'}`);
        console.log(`Content:\n${res.content}\n`);
      });
    }
  } catch (error) {
    console.error('\n[RETRIEVAL ERROR] Test retrieval failed:', error.message);
  } finally {
    await closeMongoDB();
    process.exit(0);
  }
}

runRetrievalTest();
