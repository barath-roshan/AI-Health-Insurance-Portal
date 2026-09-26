require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { loadCSV } = require('../src/ingestion/csvLoader');
const { normalizeMetadata, computeSearchableTextHash } = require('../src/ingestion/metadataNormalizer');
const { generateDocumentEmbedding, HF_PROVIDER, HF_EMBEDDING_MODEL } = require('../src/embeddings/embeddingService');
const logger = require('../src/utils/logger');

const INTER_REQUEST_DELAY_MS = parseInt(process.env.EMBED_DELAY_MS) || 600;
const EXPECTED_DIM = parseInt(process.env.EMBEDDING_DIMENSIONS) || 1024;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  try {
    logger.info('='.repeat(60));
    logger.info('KAAPAN — GENERATE E5 EMBEDDINGS & SQL UPDATE BATCH');
    logger.info(`Model:         ${HF_EMBEDDING_MODEL}`);
    logger.info(`Provider:      ${HF_PROVIDER}`);
    logger.info(`Expected dim:  ${EXPECTED_DIM}`);
    logger.info(`Request delay: ${INTER_REQUEST_DELAY_MS}ms between calls`);
    logger.info('='.repeat(60));

    const csvPath = path.resolve(__dirname, '../data/health_scheme_rag_metadata_dataset.csv');
    const rawRows = await loadCSV(csvPath);
    const schemes = rawRows.map(normalizeMetadata);

    logger.info(`Loaded ${schemes.length} schemes from CSV.\n`);

    // PRE-FLIGHT test on 3 samples
    logger.info('[PRE-FLIGHT] Testing HF API with 3 sample schemes...');
    const samples = schemes.slice(0, 3);
    for (const sample of samples) {
      const vec = await generateDocumentEmbedding(sample.searchableText);
      if (!Array.isArray(vec) || vec.length !== EXPECTED_DIM) {
        throw new Error(`Sample failed: ${sample.schemeId}`);
      }
      if (vec.every(v => v === 0)) throw new Error('All zero vector returned!');
      logger.info(`[PRE-FLIGHT OK] ${sample.schemeId} dim=${vec.length} first3=[${vec.slice(0,3).map(v=>v.toFixed(4)).join(', ')}]`);
      await sleep(INTER_REQUEST_DELAY_MS);
    }
    logger.info('[PRE-FLIGHT PASSED] Starting embedding generation for all 130 schemes...\n');

    let sql = '-- SQL Update Script for E5 Vector Embeddings (1024-dim)\n';
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < schemes.length; i++) {
      const scheme = schemes[i];
      const indexStr = `${i + 1}/${schemes.length}`;

      try {
        if (i > 0) await sleep(INTER_REQUEST_DELAY_MS);

        const vector = await generateDocumentEmbedding(scheme.searchableText);

        if (!Array.isArray(vector) || vector.length !== EXPECTED_DIM) {
          throw new Error(`Invalid dim: ${vector ? vector.length : 0}`);
        }
        if (vector.every(v => v === 0)) {
          throw new Error('All-zero vector detected, refusing to store');
        }

        const hash = computeSearchableTextHash(scheme.searchableText);
        const vecStr = '[' + vector.join(',') + ']';

        sql += `UPDATE public.scheme_knowledge SET embedding = '${vecStr}', embedding_model = '${HF_EMBEDDING_MODEL}', embedding_dimensions = ${EXPECTED_DIM}, searchable_text_hash = '${hash}', updated_at = NOW() WHERE scheme_id = '${scheme.schemeId}';\n`;

        logger.info(`[OK] ${indexStr} ${scheme.schemeId} (${scheme.schemeName.substring(0, 30)}...) dim=${vector.length}`);
        successCount++;
      } catch (err) {
        logger.error(`[FAILED] ${indexStr} ${scheme.schemeId}: ${err.message}`);
        failCount++;
      }
    }

    const outputPath = path.resolve(__dirname, '../data/update_embeddings_130.sql');
    fs.writeFileSync(outputPath, sql);

    logger.info('\n' + '='.repeat(60));
    logger.info('EMBEDDING GENERATION SUMMARY');
    logger.info(`  Total schemes:         ${schemes.length}`);
    logger.info(`  Successfully embedded: ${successCount}`);
    logger.info(`  Failed:                ${failCount}`);
    logger.info(`  SQL file written:      ${outputPath}`);
    logger.info('='.repeat(60));

  } catch (err) {
    logger.error('Embedding generation script failed:', err.message);
    process.exitCode = 1;
  }
}

main();
