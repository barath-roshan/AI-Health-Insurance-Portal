const fs = require('fs');
const pdf = require('pdf-parse');

/**
 * Extract raw text from a PDF file using pdf-parse.
 * @param {string} filePath - Absolute or relative path to PDF file
 * @returns {Promise<{ text: string, numPages: number }>}
 */
async function extractTextFromPDF(filePath) {
  if (!filePath) {
    throw new Error('[INGESTION ERROR] File path is required for PDF extraction.');
  }

  if (!fs.existsSync(filePath)) {
    throw new Error(`[INGESTION ERROR] PDF file does not exist at path: "${filePath}"`);
  }

  let dataBuffer;
  try {
    dataBuffer = fs.readFileSync(filePath);
  } catch (err) {
    throw new Error(`[INGESTION ERROR] Failed to read PDF file "${filePath}": ${err.message}`);
  }

  try {
    const data = await pdf(dataBuffer);

    if (!data || !data.text || data.text.trim().length === 0) {
      throw new Error(`[INGESTION ERROR] PDF file at "${filePath}" is empty or has no readable text.`);
    }

    return {
      text: data.text,
      numPages: data.numpages || 1
    };
  } catch (err) {
    if (err.message.includes('PDF file at')) {
      throw err;
    }
    throw new Error(`[INGESTION ERROR] Failed to parse PDF file "${filePath}": ${err.message}`);
  }
}

module.exports = {
  extractTextFromPDF
};
