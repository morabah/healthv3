/**
 * Logger utility for Firebase Functions
 * Provides consistent logging with timestamps and environment-based debug logging
 */

// Environment check for debug logging
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Format timestamp for log messages
 */
const getTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Log levels and their corresponding console methods
 */
type LogLevel = 'log' | 'warn' | 'error' | 'debug';

/**
 * Core logging function with timestamp prefix
 */
const logWithLevel = (level: LogLevel, ...args: any[]): void => {
  const timestamp = getTimestamp();
  const prefix = `[${timestamp}]`;
  
  switch (level) {
    case 'log':
      console.log(prefix, ...args);
      break;
    case 'warn':
      console.warn(prefix, ...args);
      break;
    case 'error':
      console.error(prefix, ...args);
      break;
    case 'debug':
      if (!isProduction) {
        console.debug(prefix, ...args);
      }
      break;
  }
};

/**
 * Logger utility functions
 */
export const logger = {
  log: (...args: any[]) => logWithLevel('log', ...args),
  warn: (...args: any[]) => logWithLevel('warn', ...args),
  error: (...args: any[]) => logWithLevel('error', ...args),
  debug: (...args: any[]) => logWithLevel('debug', ...args),
};
