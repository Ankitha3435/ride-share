/**
 * Centralized logging configuration
 * 
 * All logs are sent to console and captured by Railway's logging system
 * Railway provides: real-time streaming, search, filtering, and 7-day retention
 */

const logger = {
  info: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] INFO:`, message, meta);
  },

  error: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR:`, message, meta);
  },

  warn: (message, meta = {}) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] WARN:`, message, meta);
  },

  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] DEBUG:`, message, meta);
    }
  }
};

module.exports = logger;

