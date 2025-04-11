/**
 * Logging utility for the Health Appointment System
 * Provides standardized logging functions with timestamps and log levels
 */

/**
 * Returns current ISO timestamp for consistent log formatting
 */
const getTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Type definition for log parameters to ensure type safety
 */
export type LogParams = {
  message: string;
  data?: unknown;
  context?: string;
};

/**
 * Formats log message with timestamp, level, context, and optional data
 */
const formatLogMessage = (
  level: string,
  { message, data, context }: LogParams
): string => {
  const timestamp = getTimestamp();
  const contextStr = context ? `[${context}] ` : '';
  const baseMessage = `[${timestamp}] [${level}] ${contextStr}${message}`;
  
  if (data !== undefined) {
    return `${baseMessage} ${JSON.stringify(data, null, 2)}`;
  }
  
  return baseMessage;
};

/**
 * Logs informational messages
 * @param params Log parameters including message, optional data, and context
 */
export const logInfo = (params: LogParams): void => {
  console.log(formatLogMessage('INFO', params));
};

/**
 * Logs warning messages
 * @param params Log parameters including message, optional data, and context
 */
export const logWarn = (params: LogParams): void => {
  console.warn(formatLogMessage('WARN', params));
};

/**
 * Logs error messages
 * @param params Log parameters including message, optional data, and context
 */
export const logError = (params: LogParams): void => {
  console.error(formatLogMessage('ERROR', params));
};

/**
 * Logs debug messages only when NEXT_PUBLIC_LOG_LEVEL is set to 'debug'
 * @param params Log parameters including message, optional data, and context
 */
export const logDebug = (params: LogParams): void => {
  if (typeof process !== 'undefined' && 
      process.env.NEXT_PUBLIC_LOG_LEVEL === 'debug') {
    console.debug(formatLogMessage('DEBUG', params));
  }
};

/**
 * Default export for convenient importing
 */
export default {
  logInfo,
  logWarn,
  logError,
  logDebug,
};
