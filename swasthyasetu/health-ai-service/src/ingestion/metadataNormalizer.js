const crypto = require('crypto');

/**
 * Splits comma/semicolon-separated string into an array of clean strings.
 */
function parseListField(rawString) {
  if (!rawString || typeof rawString !== 'string') return [];
  return rawString
    .split(/[;,]+/)
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

/**
 * Normalizes string values, converting empty/placeholder strings to empty string or null.
 */
function normalizeString(value) {
  if (value === null || value === undefined) return '';
  const trimmed = String(value).trim();
  if (['null', 'undefined', 'n/a', 'none'].includes(trimmed.toLowerCase())) {
    return '';
  }
  return trimmed;
}

/**
 * Computes SHA-256 hash of searchableText.
 */
function computeSearchableTextHash(text) {
  if (!text) return '';
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Normalizes a raw CSV row object into a MongoDB-ready scheme document schema.
 * 
 * @param {Object} rawRow - Raw key-value object from CSV
 * @returns {Object} Normalized scheme document object
 */
function normalizeMetadata(rawRow) {
  const schemeId = normalizeString(rawRow.scheme_id);
  const category = normalizeString(rawRow.category);
  const stateOrRegion = normalizeString(rawRow.state_or_region);
  const schemeName = normalizeString(rawRow.scheme_name);
  const schemeDescription = normalizeString(rawRow.scheme_description);
  const schemeEligibility = normalizeString(rawRow.scheme_eligibility);
  const keywords = parseListField(rawRow.keywords);
  const searchAliases = parseListField(rawRow.search_aliases);
  const intentTags = parseListField(rawRow.intent_tags);
  const sourceUrl = normalizeString(rawRow.source_url);
  const sourceType = normalizeString(rawRow.source_type);
  const notes = normalizeString(rawRow.notes);
  
  // Preserve verificationStatus (do not auto-mark as verified)
  let verificationStatus = normalizeString(rawRow.verification_status);
  if (!verificationStatus) {
    verificationStatus = 'needs_verification';
  }

  const lastVerifiedAtRaw = normalizeString(rawRow.last_verified_at);
  const lastVerifiedAt = lastVerifiedAtRaw ? new Date(lastVerifiedAtRaw) : null;
  const version = normalizeString(rawRow.version) || null;

  // Searchable text is specifically embedded for RAG
  const searchableText = normalizeString(rawRow.searchable_text);
  const searchableTextHash = computeSearchableTextHash(searchableText);

  return {
    schemeId,
    category,
    stateOrRegion,
    schemeName,
    schemeDescription,
    schemeEligibility,
    keywords,
    searchAliases,
    intentTags,
    searchableText,
    searchableTextHash,
    sourceUrl,
    sourceType,
    verificationStatus,
    lastVerifiedAt,
    version,
    notes,
    _csvRowNumber: rawRow._csvRowNumber
  };
}

module.exports = {
  normalizeMetadata,
  computeSearchableTextHash,
  parseListField,
  normalizeString
};
