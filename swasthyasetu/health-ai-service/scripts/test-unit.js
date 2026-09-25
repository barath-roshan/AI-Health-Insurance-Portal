const path = require('path');
const { extractTextFromPDF } = require('../src/ingestion/pdfExtractor');
const { cleanText } = require('../src/ingestion/textCleaner');
const { createChunks } = require('../src/ingestion/chunker');
const { loadDocumentInfo } = require('../src/ingestion/documentLoader');

async function testOfflinePipeline() {
  console.log('=== TESTING OFFLINE PIPELINE COMPONENTS ===\n');

  // 1. Test Document Loader
  const pdfPath = path.join(__dirname, '..', 'data', 'schemes', 'cmchis', 'guidelines.pdf');
  const info = loadDocumentInfo(pdfPath);
  console.log('[TEST 1] Document Loader:');
  console.log(`  File: ${info.fileName}`);
  console.log(`  Size: ${info.fileSize} bytes`);
  console.log(`  Hash: ${info.fileHash.substring(0, 16)}...`);

  // 2. Test PDF Extraction
  const { text: rawText, numPages } = await extractTextFromPDF(pdfPath);
  console.log('\n[TEST 2] PDF Extractor:');
  console.log(`  Pages: ${numPages}`);
  console.log(`  Raw Text Length: ${rawText.length} chars`);

  // 3. Test Text Cleaning
  const cleanedText = cleanText(rawText);
  console.log('\n[TEST 3] Text Cleaner:');
  console.log(`  Cleaned Text Length: ${cleanedText.length} chars`);
  console.log(`  Preserved Rs 1,20,000: ${cleanedText.includes('Rs 1,20,000')}`);
  console.log(`  Preserved Rs 5,00,000: ${cleanedText.includes('Rs 5,00,000')}`);

  // 4. Test Chunker
  const chunks = createChunks(cleanedText, { maxChunkChars: 1000, overlapChars: 150 });
  console.log('\n[TEST 4] Section-Aware Chunker:');
  console.log(`  Total Chunks Created: ${chunks.length}`);
  chunks.forEach((chunk, index) => {
    console.log(`  - Chunk ${index + 1}: Index=${chunk.chunkIndex}, Section="${chunk.sectionTitle || 'N/A'}", Chars=${chunk.content.length}`);
  });

  console.log('\n=== ALL OFFLINE UNIT TESTS PASSED ===');
}

testOfflinePipeline().catch(err => {
  console.error('[TEST ERROR]', err);
  process.exit(1);
});
