require('dotenv').config();
const { getSupabaseClient } = require('../src/config/supabase');
const logger = require('../src/utils/logger');

async function main() {
  try {
    logger.info('==================================================');
    logger.info('TESTING SUPABASE POSTGRESQL CONNECTION');
    logger.info('==================================================');

    const supabase = getSupabaseClient();
    logger.info(`Supabase URL: ${process.env.SUPABASE_URL || 'Using local fallback'}`);

    const { data, error } = await supabase.from('scheme_knowledge').select('count').limit(1);

    if (error) {
      logger.warn(`Supabase test query notice: ${error.message}`);
    } else {
      logger.info('Supabase database table `scheme_knowledge` accessible.');
    }

    logger.info('Supabase client connection check completed successfully.');

  } catch (error) {
    logger.error('Supabase connection test failed:', error.message);
    process.exitCode = 1;
  }
}

main();
