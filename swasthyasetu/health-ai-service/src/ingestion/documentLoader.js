const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Utility to calculate deterministic SHA-256 hash of a file's content
 * @param {string} filePath - Absolute path to file
 * @returns {string} Hex hash string
 */
function calculateFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

/**
 * Read document basic information
 * @param {string} filePath - Absolute path to file
 * @returns {object} Document file details
 */
function loadDocumentInfo(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`[LOADER ERROR] Document not found at path: ${filePath}`);
  }

  const stat = fs.statSync(filePath);
  const fileName = path.basename(filePath);
  const fileHash = calculateFileHash(filePath);

  return {
    filePath,
    fileName,
    fileSize: stat.size,
    fileHash,
    createdAt: stat.birthtime
  };
}

module.exports = {
  calculateFileHash,
  loadDocumentInfo
};
