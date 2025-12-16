/**
 * Error handling and logging utilities for Uptick API system
 * Provides structured error handling and comprehensive logging
 */

import localDebug from '../_platform/logging/debug-log';
import type { ApiError, LogLevel, RequestContext } from './types';

// Error codes for different types of failures
export const ERROR_CODES = {
  // Validation errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_PARAMETERS: 'INVALID_PARAMETERS',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // Data errors
  NOT_FOUND: 'NOT_FOUND',
  DATA_FETCH_FAILED: 'DATA_FETCH_FAILED',
  GRAPHQL_ERROR: 'GRAPHQL_ERROR',

  // System errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  TIMEOUT: 'TIMEOUT',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Configuration errors
  INVALID_CONFIGURATION: 'INVALID_CONFIGURATION',
  MISSING_CONFIGURATION: 'MISSING_CONFIGURATION',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

// HTTP status code mappings
const ERROR_STATUS_MAP: Record<ErrorCode, number> = {
  [ERROR_CODES.VALIDATION_FAILED]: 400,
  [ERROR_CODES.INVALID_PARAMETERS]: 400,
  [ERROR_CODES.MISSING_REQUIRED_FIELD]: 400,
  [ERROR_CODES.NOT_FOUND]: 404,
  [ERROR_CODES.DATA_FETCH_FAILED]: 502,
  [ERROR_CODES.GRAPHQL_ERROR]: 502,
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: 500,
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 503,
  [ERROR_CODES.TIMEOUT]: 504,
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 429,
  [ERROR_CODES.INVALID_CONFIGURATION]: 500,
  [ERROR_CODES.MISSING_CONFIGURATION]: 500,
};

/**
 * Custom error class for Uptick API errors
 */
export class UptickApiError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;
  public readonly isOperational: boolean;

  constructor(
    code: ErrorCode,
    message: string,
    details?: Record<string, unknown>,
    isOperational = true
  ) {
    super(message);
    this.name = 'UptickApiError';
    this.code = code;
    this.statusCode = ERROR_STATUS_MAP[code] || 500;
    this.details = details;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UptickApiError);
    }
  }

  toApiError(): ApiError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      statusCode: this.statusCode,
    };
  }
}

/**
 * Logger interface for structured logging
 */
export interface Logger {
  error(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  debug(message: string, meta?: Record<string, unknown>): void;
}

/**
 * Simple console logger implementation. Note, this outputs via the localDebug implementation
 */
export class ConsoleLogger implements Logger {
  private logLevel: LogLevel;

  constructor(logLevel: LogLevel = 'info') {
    this.logLevel = logLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
    };
    return levels[level] <= levels[this.logLevel];
  }

  private formatMessage(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  }

  error(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog('error')) {
      localDebug.uptick.error(this.formatMessage('error', message, meta));
    }
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog('warn')) {
      localDebug.uptick.warn(this.formatMessage('warn', message, meta));
    }
  }

  info(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog('info')) {
      localDebug.uptick.info(this.formatMessage('info', message, meta));
    }
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog('debug')) {
      localDebug.uptick(this.formatMessage('debug', message, meta));
    }
  }
}

// Global logger instance
let globalLogger: Logger = new ConsoleLogger();

export function setLogger(logger: Logger): void {
  globalLogger = logger;
}

export function getLogger(): Logger {
  return globalLogger;
}

/**
 * Error handling utilities
 */
export function createValidationError(
  message: string,
  details?: Record<string, unknown>
): UptickApiError {
  return new UptickApiError(ERROR_CODES.VALIDATION_FAILED, message, details);
}

export function createNotFoundError(resource: string, identifier: string): UptickApiError {
  return new UptickApiError(ERROR_CODES.NOT_FOUND, `${resource} not found`, {
    resource,
    identifier,
  });
}

export function createDataFetchError(message: string, originalError?: unknown): UptickApiError {
  const details: Record<string, unknown> = {};

  if (originalError instanceof Error) {
    details.originalMessage = originalError.message;
    details.originalStack = originalError.stack;
  } else if (originalError) {
    details.originalError = originalError;
  }

  return new UptickApiError(ERROR_CODES.DATA_FETCH_FAILED, message, details);
}

export function createGraphQLError(message: string, graphqlErrors?: unknown[]): UptickApiError {
  return new UptickApiError(ERROR_CODES.GRAPHQL_ERROR, message, { graphqlErrors });
}

export function createTimeoutError(operation: string, timeout: number): UptickApiError {
  return new UptickApiError(ERROR_CODES.TIMEOUT, `Operation timed out: ${operation}`, {
    operation,
    timeout,
  });
}

// Extracts the original error details from uptick api errors created by `createDataFetchError`
export function extractOriginalErrorDetails(error: UptickApiError): Record<string, string> {
  const errorDetails: Record<string, string> = {};
  if (error === undefined || !(error instanceof UptickApiError)) return errorDetails;

  if (error.details?.originalError !== undefined) {
    errorDetails.originalMessage = error.details?.originalError?.message || 'Unknown error';
    errorDetails.originalStack = error.details?.originalError?.stack || undefined;
  }
  else {
    if (error.details?.originalMessage) 
      errorDetails.originalMessage = error.details.originalMessage as string;
    if (error.details?.originalStack) 
      errorDetails.originalStack = error.details.originalStack;
  }

  return errorDetails;
}

/**
 * Safe error conversion for API responses
 */
export function toApiError(error: unknown, context?: RequestContext): ApiError {
  const logger = getLogger();

  if (error instanceof UptickApiError) {
    logger.error('API Error', {
      code: error.code,
      message: error.message,
      details: error.details,
      requestId: context?.requestId,
    });

    return error.toApiError();
  }

  if (error instanceof Error) {
    logger.error('Unexpected Error', {
      message: error.message,
      stack: error.stack,
      requestId: context?.requestId,
    });

    return {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred',
      statusCode: 500,
    };
  }

  logger.error('Unknown Error', {
    error: String(error),
    requestId: context?.requestId,
  });

  return {
    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    message: 'An unknown error occurred',
    statusCode: 500,
  };
}

/**
 * Error boundary for async operations
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: RequestContext,
  operationName?: string
): Promise<T> {
  const logger = getLogger();
  const startTime = Date.now();

  try {
    logger.debug(`Starting operation: ${operationName || 'unknown'}`, {
      requestId: context?.requestId,
    });

    const result = await operation();

    const duration = Date.now() - startTime;
    logger.debug(`Operation completed: ${operationName || 'unknown'}`, {
      requestId: context?.requestId,
      duration,
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`Operation failed: ${operationName || 'unknown'}`, {
      requestId: context?.requestId,
      duration,
      error: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private startTime: number;
  private checkpoints: Array<{ name: string; time: number }> = [];

  constructor() {
    this.startTime = Date.now();
  }

  checkpoint(name: string): void {
    this.checkpoints.push({
      name,
      time: Date.now() - this.startTime,
    });
  }

  getMetrics(): {
    totalTime: number;
    checkpoints: Array<{ name: string; time: number; delta: number }>;
  } {
    const totalTime = Date.now() - this.startTime;
    const enhancedCheckpoints = this.checkpoints.map((checkpoint, index) => ({
      ...checkpoint,
      delta: index === 0 ? checkpoint.time : checkpoint.time - this.checkpoints[index - 1].time,
    }));

    return {
      totalTime,
      checkpoints: enhancedCheckpoints,
    };
  }
}

/**
 * Request ID generation
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
