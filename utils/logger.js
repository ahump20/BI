/**
 * Centralized Production Logging Utility
 * Uses Winston for structured logging with rotation and multiple transports
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Tell winston about our colors
winston.addColors(colors);

// Custom format for structured logging
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    let metaStr = '';

    if (Object.keys(meta).length > 0) {
      // Remove stack trace from console output but keep in logs
      const consoleMeta = { ...meta };
      delete consoleMeta.stack;
      metaStr = Object.keys(consoleMeta).length > 0
        ? ` ${JSON.stringify(consoleMeta)}`
        : '';
    }

    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  })
);

// Environment-based logging level
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'info';
};

// Transports configuration
const transports = [
  // Console transport for all environments
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      winston.format.printf(
        (info) => `[${info.timestamp}] ${info.level}: ${info.message}`
      )
    ),
  }),

  // Rotating file transport for errors
  new DailyRotateFile({
    filename: join(__dirname, '../logs/error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '30d',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),

  // Rotating file transport for all logs
  new DailyRotateFile({
    filename: join(__dirname, '../logs/combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
];

// Create the logger instance
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  // Don't exit on uncaught exceptions
  exitOnError: false,
});

// Add request logging helper
logger.logRequest = (req, res, duration) => {
  const logData = {
    method: req.method,
    url: req.url,
    status: res.statusCode,
    duration: `${duration}ms`,
    ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown',
    userAgent: req.headers['user-agent'],
  };

  const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
  logger[level](`HTTP ${req.method} ${req.url}`, logData);
};

// Add structured error logging
logger.logError = (error, context = {}) => {
  logger.error(error.message, {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    ...context,
  });
};

// Add API error logging with sanitization
logger.logAPIError = (endpoint, error, sanitizedData = {}) => {
  logger.error(`API Error at ${endpoint}`, {
    endpoint,
    error: {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack,
    },
    data: sanitizedData, // Always sanitize sensitive data before logging
    timestamp: new Date().toISOString(),
  });
};

// Add security event logging
logger.logSecurityEvent = (event, details = {}) => {
  logger.warn(`Security Event: ${event}`, {
    event,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

// Add performance logging
logger.logPerformance = (operation, duration, metadata = {}) => {
  logger.info(`Performance: ${operation}`, {
    operation,
    duration: `${duration}ms`,
    ...metadata,
  });
};

// Create audit logger for sensitive operations
logger.audit = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new DailyRotateFile({
      filename: join(__dirname, '../logs/audit-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '90d', // Keep audit logs longer
    }),
  ],
});

// Handle uncaught exceptions and unhandled rejections
if (process.env.NODE_ENV === 'production') {
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    });
    // Give time for logs to write before exiting
    setTimeout(() => process.exit(1), 1000);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection:', {
      promise,
      reason: reason instanceof Error ? {
        name: reason.name,
        message: reason.message,
        stack: reason.stack,
      } : reason,
    });
  });
}

export default logger;
