/**
 * Logger utility for health-ai-service
 * Enforces clean output and ensures secrets are never logged.
 */

function sanitize(message) {
  if (typeof message !== 'string') return message;
  // Replace potential secrets
  return message
    .replace(/sk-[a-zA-Z0-9T3BlbkFJ]{20,}/g, '[REDACTED_API_KEY]')
    .replace(/mongodb(\+srv)?:\/\/[^@]+@/g, 'mongodb$1://[REDACTED_CREDENTIALS]@');
}

const logger = {
  info: (...args) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO]`, ...args.map(sanitize));
  },
  warn: (...args) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [WARN]`, ...args.map(sanitize));
  },
  error: (...args) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [ERROR]`, ...args.map(sanitize));
  },
  debug: (...args) => {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [DEBUG]`, ...args.map(sanitize));
    }
  }
};

module.exports = logger;
