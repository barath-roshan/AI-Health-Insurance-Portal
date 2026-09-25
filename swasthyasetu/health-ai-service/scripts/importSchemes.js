require('dotenv').config();
const path = require('path');
const { ingestSchemesFromCSV } = require('../src/ingestion/schemeIngestion');
const logger = require('../src/utils/logger');

async function main() {
  try {
    logger.info('==================================================');
    logger.info('IMPORT HEALTH SCHEMES FROM CSV TO SUPABASE POSTGRESQL');
    logger.info('==================================================');

    const csvPath = path.resolve(__dirname, '../data/health_scheme_rag_metadata_dataset.csv');
    logger.info(`Target CSV path: ${csvPath}`);

    const result = await ingestSchemesFromCSV(csvPath);

    logger.info('Scheme import completed successfully.');
    logger.info(`Summary: Parsed=${result.totalParsed}, Valid=${result.validCount}, Invalid=${result.invalidCount}, Upserted=${result.upsertedCount}`);
  } catch (error) {
    logger.error('Import failed:', error.message);
    process.exitCode = 1;
  }
}

main();
