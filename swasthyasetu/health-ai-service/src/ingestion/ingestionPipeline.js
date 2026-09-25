const { extractTextFromPDF } = require('./pdfExtractor');
const { cleanText } = require('./textCleaner');
const { createChunks } = require('./chunker');
const { calculateFileHash } = require('./documentLoader');
const { generateEmbeddings } = require('../embeddings/embeddingService');
const { getDB } = require('../config/mongodb');

const KNOWLEDGE_COLLECTION = 'knowledge_chunks';

/**
 * Ingest a scheme document PDF into MongoDB with deduplication and embeddings.
 * @param {object} params
 * @param {string} params.filePath - Path to PDF file
 * @param {string} params.schemeId - Scheme ID (e.g. "cmchis")
 * @param {string} params.documentName - Human readable document name
 * @param {object} [params.metadata={}] - Additional metadata (authority, category, language, version, verified, sourceUrl)
 * @returns {Promise<object>} Status report
 */
async function ingestDocument({ filePath, schemeId, documentName, metadata = {} }) {
  if (!filePath || !schemeId || !documentName) {
    throw new Error('[INGESTION ERROR] filePath, schemeId, and documentName are required parameters.');
  }

  const db = getDB();
  const collection = db.collection(KNOWLEDGE_COLLECTION);

  // 1. Calculate deterministic hash to prevent duplicates (STEP 13)
  const fileHash = calculateFileHash(filePath);
  const documentId = `${schemeId}_${fileHash.substring(0, 16)}`;

  // Check if this document has already been ingested
  const existingChunk = await collection.findOne({ documentId });
  if (existingChunk) {
    console.log(`[INGESTION] Document "${documentName}" (${schemeId}) with ID ${documentId} is already ingested. Skipping.`);
    return {
      status: 'skipped',
      message: 'Document already ingested.',
      documentId,
      fileHash
    };
  }

  console.log(`[INGESTION] Reading document: "${documentName}" from "${filePath}"...`);
  // 2. Extract text
  const { text: rawText, numPages } = await extractTextFromPDF(filePath);
  console.log(`[INGESTION] Extracted ${rawText.length} characters across ${numPages} page(s).`);

  // 3. Clean text
  const cleanedText = cleanText(rawText);
  if (!cleanedText) {
    throw new Error('[INGESTION ERROR] Cleaned text is empty.');
  }

  // 4. Create section-aware chunks
  const chunks = createChunks(cleanedText);
  console.log(`[INGESTION] Created ${chunks.length} chunks.`);

  if (chunks.length === 0) {
    throw new Error('[INGESTION ERROR] No valid chunks generated from document.');
  }

  // 5. Generate embeddings for chunks
  console.log('[EMBEDDING] Generating embeddings for chunks...');
  const chunkTexts = chunks.map(c => c.content);
  const embeddings = await generateEmbeddings(chunkTexts);

  // 6. Build document records for MongoDB insertion
  const now = new Date();
  const documentsToInsert = chunks.map((chunk, idx) => {
    const chunkEmbedding = embeddings[idx];

    // Validation
    if (!chunk.content || chunk.content.trim().length === 0) {
      throw new Error(`[INGESTION ERROR] Chunk at index ${idx} is empty.`);
    }
    if (!chunkEmbedding || !Array.isArray(chunkEmbedding)) {
      throw new Error(`[INGESTION ERROR] Missing embedding for chunk index ${idx}.`);
    }

    return {
      schemeId,
      documentId,
      documentName,
      fileHash,
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      embedding: chunkEmbedding,
      metadata: {
        sourceUrl: metadata.sourceUrl || '',
        authority: metadata.authority || 'Government Health Agency',
        category: metadata.category || 'general',
        language: metadata.language || 'en',
        version: metadata.version || 1,
        verified: metadata.verified !== undefined ? metadata.verified : true,
        sectionTitle: chunk.sectionTitle || metadata.sectionTitle || null,
        totalPages: numPages,
        ...metadata
      },
      createdAt: now
    };
  });

  // 7. Store in MongoDB
  const result = await collection.insertMany(documentsToInsert);
  console.log(`[INGESTION] Successfully inserted ${result.insertedCount} chunks into "${KNOWLEDGE_COLLECTION}".`);

  return {
    status: 'success',
    documentId,
    insertedCount: result.insertedCount,
    totalChunks: chunks.length
  };
}

module.exports = {
  ingestDocument,
  KNOWLEDGE_COLLECTION
};
