const fs = require('fs');
const csv = require('csv-parser');
const logger = require('../utils/logger');

/**
 * Reads a CSV file and returns an array of record objects.
 * Handles multi-line quoted strings appropriately and strips UTF-8 BOM.
 * 
 * @param {string} filePath - Absolute or relative path to CSV file
 * @returns {Promise<Object[]>} Array of raw row objects
 */
function loadCSV(filePath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      return reject(new Error(`[CSV LOADER ERROR] File not found at path: ${filePath}`));
    }

    const results = [];
    let rowCount = 0;

    fs.createReadStream(filePath)
      .pipe(csv({
        mapHeaders: ({ header }) => header.replace(/^\uFEFF/, '').trim()
      }))
      .on('data', (data) => {
        rowCount++;
        results.push({ ...data, _csvRowNumber: rowCount + 1 });
      })
      .on('end', () => {
        logger.info(`Successfully parsed ${results.length} rows from CSV file: ${filePath}`);
        resolve(results);
      })
      .on('error', (error) => {
        logger.error(`Failed to read CSV file ${filePath}:`, error.message);
        reject(error);
      });
  });
}

module.exports = {
  loadCSV
};
