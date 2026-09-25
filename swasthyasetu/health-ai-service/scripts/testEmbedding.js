require('dotenv').config();
const { generateDocumentEmbedding, generateQueryEmbedding, HF_PROVIDER, HF_EMBEDDING_MODEL } = require('../src/embeddings/embeddingService');
const logger = require('../src/utils/logger');

async function main() {
  try {
    logger.info('==================================================');
    logger.info('TESTING HUGGING FACE EMBEDDING SERVICE');
    logger.info(`Model:    ${HF_EMBEDDING_MODEL}`);
    logger.info(`Provider: ${HF_PROVIDER}`);
    logger.info('==================================================\n');

    const sampleDocument = 'Scheme: Chief Minister Comprehensive Health Insurance Scheme CMCHIS Region: Tamil Nadu';
    const sampleQuery = 'government health insurance in Tamil Nadu';

    logger.info(`Generating document embedding for: "${sampleDocument.substring(0, 45)}..."`);
    const docVector = await generateDocumentEmbedding(sampleDocument);

    logger.info(`Generating query embedding for: "${sampleQuery}"`);
    const queryVector = await generateQueryEmbedding(sampleQuery);

    const docDim = docVector ? docVector.length : 0;
    const queryDim = queryVector ? queryVector.length : 0;
    const dimensionsMatch = docDim > 0 && docDim === queryDim;
    const isDocNumeric = Array.isArray(docVector) && docVector.every(v => typeof v === 'number' && !isNaN(v));
    const isQueryNumeric = Array.isArray(queryVector) && queryVector.every(v => typeof v === 'number' && !isNaN(v));

    console.log('\n--------------------------------------------------');
    console.log(`Document embedding dimension: ${docDim}`);
    console.log(`Query embedding dimension:    ${queryDim}`);
    console.log(`Dimensions match:             ${dimensionsMatch}`);
    console.log(`Document values numeric:      ${isDocNumeric}`);
    console.log(`Query values numeric:         ${isQueryNumeric}`);
    console.log('--------------------------------------------------\n');

    if (!dimensionsMatch || !isDocNumeric || !isQueryNumeric) {
      throw new Error('[TEST FAILED] Embedding validation checks failed!');
    }

    logger.info(`SUCCESS! Verified model "${HF_EMBEDDING_MODEL}" outputs ${docDim}-dimensional float vectors.`);
    logger.info(`Configuration value to set in .env: EMBEDDING_DIMENSIONS=${docDim}`);

  } catch (error) {
    logger.error('Embedding test script failed:', error.message);
    process.exitCode = 1;
  }
}

main();
