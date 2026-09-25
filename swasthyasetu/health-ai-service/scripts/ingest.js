require('dotenv').config();
const path = require('path');
const { connectMongoDB, closeMongoDB } = require('../src/config/mongodb');
const { ingestDocument } = require('../src/ingestion/ingestionPipeline');

async function runIngestion() {
  console.log('[DB] Connecting to MongoDB...');
  try {
    await connectMongoDB();

    const samplePdfPath = path.join(__dirname, '..', 'data', 'schemes', 'cmchis', 'guidelines.pdf');

    const result = await ingestDocument({
      filePath: samplePdfPath,
      schemeId: 'cmchis',
      documentName: 'Chief Minister Comprehensive Health Insurance Scheme Guidelines',
      metadata: {
        authority: 'Government of Tamil Nadu - Department of Health & Family Welfare',
        category: 'eligibility_and_benefits',
        language: 'en',
        version: 1,
        verified: true,
        sourceUrl: 'https://www.cmchistn.com'
      }
    });

    if (result.status === 'skipped') {
      console.log(`\n[INGESTION] ${result.message}`);
      console.log(`[INGESTION] Document ID: ${result.documentId}`);
    } else {
      console.log('\n[INGESTION] Ingestion completed successfully.');
      console.log(`[INGESTION] Chunks processed & inserted: ${result.insertedCount}`);
      console.log(`[INGESTION] Document ID: ${result.documentId}`);
    }
  } catch (error) {
    console.error('\n[INGESTION ERROR] Ingestion failed:', error.message);
  } finally {
    await closeMongoDB();
    process.exit(0);
  }
}

runIngestion();
