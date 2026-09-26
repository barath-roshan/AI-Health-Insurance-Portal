const fs = require('fs');
const path = require('path');
const { loadCSV } = require('../src/ingestion/csvLoader');
const { normalizeMetadata } = require('../src/ingestion/metadataNormalizer');

async function run() {
  const csvPath = path.resolve(__dirname, '../data/health_scheme_rag_metadata_dataset.csv');
  const rows = await loadCSV(csvPath);
  const normalized = rows.map(normalizeMetadata);
  
  const escapeSql = (val) => {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'number') return val;
    if (Array.isArray(val)) {
      const escapedItems = val.map(v => '"' + String(v).replace(/"/g, '\\"') + '"');
      return "'{" + escapedItems.join(',') + "}'";
    }
    return "'" + String(val).replace(/'/g, "''") + "'";
  };

  let sql = '-- SQL Import for 130 Health Schemes into scheme_knowledge table\n';
  sql += 'INSERT INTO public.scheme_knowledge (scheme_id, category, state_or_region, scheme_name, scheme_description, scheme_eligibility, keywords, search_aliases, intent_tags, searchable_text, searchable_text_hash, source_url, source_type, verification_status, version, notes)\nVALUES\n';

  const valueRows = normalized.map(r => {
    return '(' + [
      escapeSql(r.schemeId),
      escapeSql(r.category),
      escapeSql(r.stateOrRegion),
      escapeSql(r.schemeName),
      escapeSql(r.schemeDescription),
      escapeSql(r.schemeEligibility),
      escapeSql(r.keywords),
      escapeSql(r.searchAliases),
      escapeSql(r.intentTags),
      escapeSql(r.searchableText),
      escapeSql(r.searchableTextHash),
      escapeSql(r.sourceUrl),
      escapeSql(r.sourceType),
      escapeSql(r.verificationStatus || 'needs_verification'),
      r.version ? parseInt(r.version) : 'NULL',
      escapeSql(r.notes)
    ].join(', ') + ')';
  });

  sql += valueRows.join(',\n') + '\nON CONFLICT (scheme_id) DO UPDATE SET\n';
  sql += 'scheme_name = EXCLUDED.scheme_name,\nsearchable_text = EXCLUDED.searchable_text,\nupdated_at = NOW();\n';

  const outputPath = path.resolve(__dirname, '../data/import_130_schemes.sql');
  fs.writeFileSync(outputPath, sql);
  console.log('Successfully generated SQL file with', normalized.length, 'records at:', outputPath);
}

run().catch(console.error);
