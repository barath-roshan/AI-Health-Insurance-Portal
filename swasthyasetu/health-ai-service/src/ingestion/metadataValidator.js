/**
 * Metadata Validator module for Health Scheme RAG pipeline.
 * Validates scheme records and checks for required fields & duplicates.
 */

const REQUIRED_CSV_COLUMNS = [
  'scheme_id',
  'category',
  'state_or_region',
  'scheme_name',
  'scheme_description',
  'scheme_eligibility',
  'keywords',
  'search_aliases',
  'intent_tags',
  'searchable_text'
];

/**
 * Validates CSV header columns.
 * @param {string[]} headers 
 * @returns {{ valid: boolean, missingColumns: string[] }}
 */
function validateCSVHeaders(headers) {
  if (!Array.isArray(headers)) {
    return { valid: false, missingColumns: REQUIRED_CSV_COLUMNS };
  }
  const missingColumns = REQUIRED_CSV_COLUMNS.filter(col => !headers.includes(col));
  return {
    valid: missingColumns.length === 0,
    missingColumns
  };
}

/**
 * Validates a single normalized scheme record.
 * 
 * @param {Object} scheme - Normalized scheme object
 * @param {Set<string>} seenSchemeIds - Set tracking previously encountered schemeIds
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateSchemeRecord(scheme, seenSchemeIds = new Set()) {
  const errors = [];

  // Validate schemeId
  if (!scheme.schemeId || typeof scheme.schemeId !== 'string' || scheme.schemeId.trim().length === 0) {
    errors.push('Missing or empty "schemeId"');
  } else if (seenSchemeIds.has(scheme.schemeId)) {
    errors.push(`Duplicate "schemeId": "${scheme.schemeId}" already exists in dataset`);
  }

  // Validate schemeName
  if (!scheme.schemeName || typeof scheme.schemeName !== 'string' || scheme.schemeName.trim().length === 0) {
    errors.push('Missing or empty "schemeName"');
  }

  // Validate searchableText
  if (!scheme.searchableText || typeof scheme.searchableText !== 'string' || scheme.searchableText.trim().length === 0) {
    errors.push('Missing or empty "searchableText"');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Batch validates a list of normalized scheme records.
 * 
 * @param {Object[]} normalizedRecords 
 * @returns {{ validRecords: Object[], invalidRecords: Object[], errors: Object[] }}
 */
function validateAllSchemes(normalizedRecords) {
  const seenSchemeIds = new Set();
  const validRecords = [];
  const invalidRecords = [];
  const errorReports = [];

  normalizedRecords.forEach((record, index) => {
    const rowNum = record._csvRowNumber || (index + 2);
    const { valid, errors } = validateSchemeRecord(record, seenSchemeIds);

    if (valid) {
      seenSchemeIds.add(record.schemeId);
      validRecords.push(record);
    } else {
      invalidRecords.push(record);
      errorReports.push({
        rowNumber: rowNum,
        schemeId: record.schemeId || 'N/A',
        schemeName: record.schemeName || 'N/A',
        errors
      });
    }
  });

  return {
    validRecords,
    invalidRecords,
    errorReports
  };
}

module.exports = {
  REQUIRED_CSV_COLUMNS,
  validateCSVHeaders,
  validateSchemeRecord,
  validateAllSchemes
};
