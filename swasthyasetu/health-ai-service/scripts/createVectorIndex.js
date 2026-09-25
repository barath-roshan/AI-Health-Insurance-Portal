require('dotenv').config();
const { connectMongoDB, getDB, closeMongoDB } = require('../src/config/mongodb');
const logger = require('../src/utils/logger');

const EMBEDDING_DIMENSIONS = parseInt(process.env.EMBEDDING_DIMENSIONS) || 1024;

const VECTOR_INDEX_DEFINITION = {
  name: "scheme_vector_index",
  type: "vectorSearch",
  definition: {
    fields: [
      {
        type: "vector",
        path: "embedding",
        numDimensions: EMBEDDING_DIMENSIONS,
        similarity: "cosine"
      },
      {
        type: "filter",
        path: "category"
      },
      {
        type: "filter",
        path: "stateOrRegion"
      },
      {
        type: "filter",
        path: "verificationStatus"
      },
      {
        type: "filter",
        path: "schemeId"
      }
    ]
  }
};

async function main() {
  try {
    logger.info('==================================================');
    logger.info('CONFIGURE MONGODB ATLAS VECTOR SEARCH INDEX');
    logger.info(`Vector Path: embedding | Dimensions: ${EMBEDDING_DIMENSIONS} | Similarity: cosine`);
    logger.info('==================================================');

    await connectMongoDB();
    const db = getDB();
    const collection = db.collection('scheme_knowledge');

    logger.info('Attempting programmatic creation of Atlas Vector Search index "scheme_vector_index"...');

    try {
      const indexName = await collection.createSearchIndex(VECTOR_INDEX_DEFINITION);
      logger.info(`Successfully created/requested Atlas Vector Search index: "${indexName}"`);
    } catch (apiError) {
      logger.warn(`Programmatic index creation notice: ${apiError.message}`);
      logger.info('\n--------------------------------------------------');
      logger.info('MANUAL ATLAS VECTOR SEARCH INDEX CREATION INSTRUCTIONS');
      logger.info('--------------------------------------------------');
      logger.info('If using MongoDB Atlas UI, perform the following steps:');
      logger.info(' 1. Log into MongoDB Atlas Dashboard.');
      logger.info(' 2. Navigate to Database -> Search -> Create Search Index.');
      logger.info(' 3. Select "Atlas Vector Search" (JSON Editor).');
      logger.info(' 4. Select Database: "' + (process.env.MONGODB_DB_NAME || 'health_ai_service') + '" & Collection: "scheme_knowledge".');
      logger.info(' 5. Set Index Name: "scheme_vector_index".');
      logger.info(' 6. Paste the following JSON definition:');
      console.log(JSON.stringify(VECTOR_INDEX_DEFINITION.definition, null, 2));
      logger.info('--------------------------------------------------\n');
    }

  } catch (error) {
    logger.error('Failed vector index setup script:', error.message);
    process.exitCode = 1;
  } finally {
    await closeMongoDB();
  }
}

main();
