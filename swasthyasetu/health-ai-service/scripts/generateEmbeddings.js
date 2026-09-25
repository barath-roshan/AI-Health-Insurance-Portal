require('dotenv').config();
const { getSupabaseClient } = require('../src/config/supabase');
const { generateDocumentEmbedding, HF_PROVIDER, HF_EMBEDDING_MODEL } = require('../src/embeddings/embeddingService');
const { computeSearchableTextHash } = require('../src/ingestion/metadataNormalizer');
const logger = require('../src/utils/logger');

const SCHEME_KNOWLEDGE_TABLE = 'scheme_knowledge';

async function main() {
  try {
    logger.info('==================================================');
    logger.info('BATCH EMBEDDING GENERATION (SUPABASE POSTGRESQL)');
    logger.info(`Model:    ${HF_EMBEDDING_MODEL}`);
    logger.info(`Provider: ${HF_PROVIDER}`);
    logger.info('==================================================');

    const supabase = getSupabaseClient();

    const { data: allSchemes, error } = await supabase
      .from(SCHEME_KNOWLEDGE_TABLE)
      .select('*');

    if (error) {
      throw new Error(`Failed to fetch scheme records from Supabase: ${error.message}`);
    }

    logger.info(`Found total ${allSchemes.length} scheme records in Supabase table "${SCHEME_KNOWLEDGE_TABLE}".`);

    if (allSchemes.length === 0) {
      logger.warn('No records found in database! Please run `npm run import:schemes` first.');
      return;
    }

    let successCount = 0;
    let skipCount = 0;
    let failCount = 0;
    let detectedDimension = null;

    for (let i = 0; i < allSchemes.length; i++) {
      const scheme = allSchemes[i];
      const indexStr = `${i + 1}/${allSchemes.length}`;

      const currentHash = scheme.searchable_text_hash || computeSearchableTextHash(scheme.searchable_text || '');
      const hasVector = Array.isArray(scheme.embedding) && scheme.embedding.length > 0;
      const modelMatches = scheme.embedding_model === HF_EMBEDDING_MODEL;

      // Skip if embedding vector is already up-to-date
      if (hasVector && modelMatches && scheme.searchable_text_hash === currentHash) {
        logger.info(`Embedding ${indexStr} - SKIPPED (already embedded with ${HF_EMBEDDING_MODEL}): ${scheme.scheme_id}`);
        skipCount++;
        if (!detectedDimension) detectedDimension = scheme.embedding.length;
        continue;
      }

      logger.info(`Embedding ${indexStr} - GENERATING: ID="${scheme.scheme_id}" Name="${scheme.scheme_name}"`);

      try {
        if (!scheme.searchable_text || scheme.searchable_text.trim().length === 0) {
          throw new Error(`Record ${scheme.scheme_id} has empty searchable_text.`);
        }

        // Generate passage embedding vector with "passage: " prefix
        const vector = await generateDocumentEmbedding(scheme.searchable_text);

        if (!Array.isArray(vector) || vector.length === 0 || typeof vector[0] !== 'number') {
          throw new Error(`Returned vector for record ${scheme.scheme_id} is invalid or non-numeric.`);
        }

        if (detectedDimension === null) {
          detectedDimension = vector.length;
          logger.info(`[DIMENSION DISCOVERY] Model output dimension verified: ${detectedDimension}`);
        } else if (vector.length !== detectedDimension) {
          throw new Error(`Inconsistent vector dimension: got ${vector.length}, expected ${detectedDimension}`);
        }

        const updateData = {
          embedding: vector,
          embedding_model: HF_EMBEDDING_MODEL,
          embedding_dimensions: vector.length,
          searchable_text_hash: currentHash,
          updated_at: new Date().toISOString()
        };

        const { error: updateError } = await supabase
          .from(SCHEME_KNOWLEDGE_TABLE)
          .update(updateData)
          .eq('scheme_id', scheme.scheme_id);

        if (updateError) {
          throw new Error(`Supabase update error: ${updateError.message}`);
        }

        logger.info(`Embedding ${indexStr} - SUCCESS: ID="${scheme.scheme_id}" (dim: ${vector.length})`);
        successCount++;
      } catch (err) {
        logger.error(`Embedding ${indexStr} - FAILED: ID="${scheme.scheme_id}":`, err.message);
        failCount++;
      }
    }

    logger.info('==================================================');
    logger.info('EMBEDDING GENERATION SUMMARY:');
    logger.info(`  Successfully embedded: ${successCount}`);
    logger.info(`  Skipped (Up-to-date): ${skipCount}`);
    logger.info(`  Failed:               ${failCount}`);
    logger.info(`  Verified Dimensions:  ${detectedDimension || 'N/A'}`);
    logger.info('==================================================');

  } catch (error) {
    logger.error('Embedding generation script failed:', error.message);
    process.exitCode = 1;
  }
}

main();
