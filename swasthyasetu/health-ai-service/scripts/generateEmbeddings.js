require('dotenv').config();
const { getSupabaseClient } = require('../src/config/supabase');
const { generateDocumentEmbedding, HF_PROVIDER, HF_EMBEDDING_MODEL } = require('../src/embeddings/embeddingService');
const { computeSearchableTextHash } = require('../src/ingestion/metadataNormalizer');
const logger = require('../src/utils/logger');

const SCHEME_KNOWLEDGE_TABLE = 'scheme_knowledge';
const INTER_REQUEST_DELAY_MS = parseInt(process.env.EMBED_DELAY_MS) || 600;
const EXPECTED_DIM = parseInt(process.env.EMBEDDING_DIMENSIONS) || 1024;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  try {
    logger.info('='.repeat(60));
    logger.info('KAAPAN — BATCH EMBEDDING GENERATION');
    logger.info(`Model:         ${HF_EMBEDDING_MODEL}`);
    logger.info(`Provider:      ${HF_PROVIDER}`);
    logger.info(`Expected dim:  ${EXPECTED_DIM}`);
    logger.info(`Request delay: ${INTER_REQUEST_DELAY_MS}ms between calls`);
    logger.info('='.repeat(60));

    const supabase = getSupabaseClient();

    const { data: allSchemes, error } = await supabase
      .from(SCHEME_KNOWLEDGE_TABLE)
      .select('scheme_id, scheme_name, searchable_text, searchable_text_hash, embedding, embedding_model, embedding_dimensions');

    if (error) {
      throw new Error(`Failed to fetch scheme records from Supabase: ${error.message}`);
    }

    if (!Array.isArray(allSchemes) || allSchemes.length === 0) {
      logger.warn('No records found in scheme_knowledge table. Run "npm run import:schemes" first.');
      return;
    }

    logger.info(`Found ${allSchemes.length} scheme records in "${SCHEME_KNOWLEDGE_TABLE}".\n`);

    // PRE-FLIGHT: Test 3 samples before bulk to verify HF API and dimensions
    logger.info('[PRE-FLIGHT] Validating HF API with 3 sample embeddings...');
    let detectedDimension = null;
    const sampleSchemes = allSchemes.slice(0, 3);
    for (const sample of sampleSchemes) {
      try {
        if (!sample.searchable_text || sample.searchable_text.trim().length === 0) {
          throw new Error(`Empty searchable_text for ${sample.scheme_id}`);
        }
        const vec = await generateDocumentEmbedding(sample.searchable_text);
        if (!Array.isArray(vec) || vec.length === 0) throw new Error('Empty vector');
        if (typeof vec[0] !== 'number' || isNaN(vec[0])) throw new Error('Non-numeric vector');
        if (vec.length !== EXPECTED_DIM) throw new Error(`Dim mismatch: got ${vec.length}, expected ${EXPECTED_DIM}`);
        if (vec.every(v => v === 0)) throw new Error('All-zero vector — fake/deterministic vector detected');
        if (!detectedDimension) detectedDimension = vec.length;
        logger.info(`[PRE-FLIGHT OK] ${sample.scheme_id} dim=${vec.length} first3=[${vec.slice(0,3).map(v=>v.toFixed(4)).join(', ')}]`);
        await sleep(INTER_REQUEST_DELAY_MS);
      } catch (e) {
        logger.error(`[PRE-FLIGHT FAILED] ${sample.scheme_id}: ${e.message}`);
        logger.error('Aborting. Fix HF_TOKEN / HF_PROVIDER before running bulk embeddings.');
        process.exitCode = 1;
        return;
      }
    }
    logger.info(`[PRE-FLIGHT PASSED] Real embeddings verified. Dim=${detectedDimension}. Starting bulk run...\n`);

    let successCount = 0;
    let skipCount = 0;
    let failCount = 0;
    const failedIds = [];

    for (let i = 0; i < allSchemes.length; i++) {
      const scheme = allSchemes[i];
      const indexStr = `${i + 1}/${allSchemes.length}`;

      const currentHash = computeSearchableTextHash(scheme.searchable_text || '');
      const hasVector = Array.isArray(scheme.embedding) && scheme.embedding.length === EXPECTED_DIM;
      const modelMatches = scheme.embedding_model === HF_EMBEDDING_MODEL;
      const hashMatches = scheme.searchable_text_hash === currentHash;

      if (hasVector && modelMatches && hashMatches) {
        logger.info(`[SKIP] ${indexStr} ${scheme.scheme_id} (already embedded, hash unchanged)`);
        skipCount++;
        continue;
      }

      logger.info(`[EMBED] ${indexStr} ${scheme.scheme_id}`);

      try {
        if (!scheme.searchable_text || scheme.searchable_text.trim().length === 0) {
          throw new Error('Empty searchable_text');
        }

        // Rate-limit protection: delay before each HF call
        if (i > 0) await sleep(INTER_REQUEST_DELAY_MS);

        const vector = await generateDocumentEmbedding(scheme.searchable_text);

        // Strict validation — hard fail, never store fake vectors
        if (!Array.isArray(vector) || vector.length === 0) throw new Error('Empty vector returned');
        if (typeof vector[0] !== 'number' || isNaN(vector[0])) throw new Error('Non-numeric vector');
        if (vector.length !== EXPECTED_DIM) throw new Error(`Dim mismatch: got ${vector.length}, expected ${EXPECTED_DIM}`);
        if (vector.every(v => v === 0)) throw new Error('All-zero vector — fake vector detected, refusing to store');

        const { error: updateError } = await supabase
          .from(SCHEME_KNOWLEDGE_TABLE)
          .update({
            embedding: vector,
            embedding_model: HF_EMBEDDING_MODEL,
            embedding_dimensions: vector.length,
            searchable_text_hash: currentHash,
            updated_at: new Date().toISOString()
          })
          .eq('scheme_id', scheme.scheme_id);

        if (updateError) throw new Error(`Supabase update failed: ${updateError.message}`);

        logger.info(`[OK] ${indexStr} ${scheme.scheme_id} dim=${vector.length}`);
        successCount++;

      } catch (err) {
        logger.error(`[FAILED] ${indexStr} ${scheme.scheme_id}: ${err.message}`);
        failCount++;
        failedIds.push(scheme.scheme_id);
      }
    }

    logger.info('');
    logger.info('='.repeat(60));
    logger.info('EMBEDDING GENERATION SUMMARY');
    logger.info(`  Total schemes in DB:   ${allSchemes.length}`);
    logger.info(`  Successfully embedded: ${successCount}`);
    logger.info(`  Skipped (up-to-date):  ${skipCount}`);
    logger.info(`  Failed:                ${failCount}`);
    logger.info(`  Verified dimension:    ${detectedDimension || 'N/A'}`);
    if (failedIds.length > 0) logger.warn(`  Failed IDs: ${failedIds.join(', ')}`);
    logger.info('='.repeat(60));

    if (failCount > 0) {
      logger.error(`[WARNING] ${failCount} schemes failed. Re-run to retry failed records.`);
      process.exitCode = 1;
    } else {
      logger.info('[SUCCESS] All schemes embedded. Vector database is ready.');
    }

  } catch (error) {
    logger.error('Embedding generation script failed:', error.message);
    process.exitCode = 1;
  }
}

main();
