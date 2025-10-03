import winston from 'winston';
import path from 'path';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');

/**
 * Winston logger configuration
 */
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // Console transport (with colors in development)
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
    }),

    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  // Don't exit on uncaught errors
  exitOnError: false,
});

/**
 * Stream for Morgan HTTP logger
 */
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

/**
 * Safe logger that never logs sensitive data
 */
export const safeLog = {
  info: (message: string, meta?: any) => {
    logger.info(message, sanitizeMeta(meta));
  },
  error: (message: string, error?: any) => {
    logger.error(message, sanitizeError(error));
  },
  warn: (message: string, meta?: any) => {
    logger.warn(message, sanitizeMeta(meta));
  },
  debug: (message: string, meta?: any) => {
    logger.debug(message, sanitizeMeta(meta));
  },
};

/**
 * Remove sensitive data from metadata
 */
function sanitizeMeta(meta: any): any {
  if (!meta) return meta;

  const sanitized = { ...meta };
  const sensitiveKeys = ['password', 'apiKey', 'api_key', 'token', 'secret', 'authorization'];

  Object.keys(sanitized).forEach((key) => {
    if (sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    }
  });

  return sanitized;
}

/**
 * Sanitize error objects
 */
function sanitizeError(error: any): any {
  if (!error) return error;

  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name,
    };
  }

  return sanitizeMeta(error);
}

export default logger;
