const { getSupabaseClient } = require('../config/supabase');
const { loadCSV } = require('./csvLoader');
const { normalizeMetadata } = require('./metadataNormalizer');
const { validateCSVHeaders, validateAllSchemes } = require('./metadataValidator');
const logger = require('../utils/logger');

const SCHEME_KNOWLEDGE_TABLE = 'scheme_knowledge';

/**
 * Ingest health scheme records from CSV dataset into Supabase PostgreSQL table `scheme_knowledge`.
 * 
 * @param {string} csvFilePath - Path to the dataset CSV file
 * @returns {Promise<{ totalParsed: number, validCount: number, invalidCount: number, upsertedCount: number }>}
 */
async function ingestSchemesFromCSV(csvFilePath) {
  logger.info(`Starting scheme ingestion from CSV into Supabase PostgreSQL: ${csvFilePath}`);

  const rawRows = await loadCSV(csvFilePath);
  if (!rawRows || rawRows.length === 0) {
    throw new Error('[INGESTION ERROR] CSV file is empty or returned 0 rows.');
  }

  // Validate headers
  const headers = Object.keys(rawRows[0]).filter(h => h !== '_csvRowNumber');
  const headerValidation = validateCSVHeaders(headers);
  if (!headerValidation.valid) {
    throw new Error(`[INGESTION ERROR] CSV missing required columns: ${headerValidation.missingColumns.join(', ')}`);
  }

  // Normalize all rows
  const normalizedRecords = rawRows.map(normalizeMetadata);

  // Validate all normalized records
  const { validRecords, invalidRecords, errorReports } = validateAllSchemes(normalizedRecords);

  if (errorReports.length > 0) {
    logger.warn(`[INGESTION WARNING] Found ${errorReports.length} invalid/malformed records:`);
    errorReports.forEach(rep => {
      logger.warn(`  Row ${rep.rowNumber} (ID: ${rep.schemeId}, Name: ${rep.schemeName}): ${rep.errors.join('; ')}`);
    });
  }

  if (validRecords.length === 0) {
    throw new Error('[INGESTION ERROR] Zero valid records found after validation. Aborting database update.');
  }

  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  // Map to PostgreSQL snake_case columns
  const dbRows = validRecords.map(rec => ({
    scheme_id: rec.schemeId,
    category: rec.category,
    state_or_region: rec.stateOrRegion,
    scheme_name: rec.schemeName,
    scheme_description: rec.schemeDescription,
    scheme_eligibility: rec.schemeEligibility,
    keywords: rec.keywords,
    search_aliases: rec.searchAliases,
    intent_tags: rec.intentTags,
    searchable_text: rec.searchableText,
    searchable_text_hash: rec.searchableTextHash,
    source_url: rec.sourceUrl,
    source_type: rec.sourceType,
    verification_status: rec.verificationStatus || 'needs_verification',
    last_verified_at: rec.lastVerifiedAt ? rec.lastVerifiedAt.toISOString() : null,
    version: rec.version ? parseInt(rec.version) : null,
    notes: rec.notes,
    updated_at: now
  }));

  // Perform duplicate-safe upsert based on scheme_id
  const { data, error } = await supabase
    .from(SCHEME_KNOWLEDGE_TABLE)
    .upsert(dbRows, { onConflict: 'scheme_id' });

  if (error) {
    logger.error('[INGESTION ERROR] Supabase upsert failed:', error.message);
    throw new Error(`Database upsert error: ${error.message}`);
  }

  logger.info(`[INGESTION COMPLETE] Results summary:`);
  logger.info(`  Total parsed CSV rows: ${rawRows.length}`);
  logger.info(`  Valid records: ${validRecords.length}`);
  logger.info(`  Invalid records: ${invalidRecords.length}`);
  logger.info(`  PostgreSQL records upserted: ${validRecords.length}`);

  return {
    totalParsed: rawRows.length,
    validCount: validRecords.length,
    invalidCount: invalidRecords.length,
    upsertedCount: validRecords.length
  };
}

module.exports = {
  SCHEME_KNOWLEDGE_TABLE,
  ingestSchemesFromCSV
};
