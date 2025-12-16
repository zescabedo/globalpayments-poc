/**
 * Base API handler with standardized error handling, validation, and logging
 * Implements SOLID principles for maintainable and testable API endpoints
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import type { ApiResponse, ResponseMeta, RequestContext, HttpMethod } from './types';
import {
  UptickApiError,
  toApiError,
  withErrorHandling,
  generateRequestId,
  PerformanceMonitor,
  getLogger,
} from './errors';

// Configuration interface
export interface ApiHandlerConfig {
  allowedMethods: HttpMethod[];
  requiresAuth?: boolean;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
  cache?: {
    enabled: boolean;
    ttl: number;
    staleWhileRevalidate?: number;
  };
  timeout?: number;
}

// Base handler interface
export interface ApiHandler<TParams = Record<string, unknown>, TResponse = unknown> {
  validate(params: TParams): Promise<void>;
  execute(params: TParams, context: RequestContext): Promise<TResponse>;
}

/**
 * Creates a standardized API handler with error handling, validation, and logging
 */
export function createApiHandler<TParams = Record<string, unknown>, TResponse = unknown>(
  handler: ApiHandler<TParams, TResponse>,
  config: ApiHandlerConfig
) {
  return async (req: NextApiRequest, res: NextApiResponse<ApiResponse<TResponse>>) => {
    const requestId = generateRequestId();
    const startTime = Date.now();
    const logger = getLogger();
    const monitor = new PerformanceMonitor();

    // Create request context
    const context: RequestContext = {
      requestId,
      startTime,
      userAgent: req.headers['user-agent'],
      ipAddress: getClientIpAddress(req),
      site: (req.query.site as string) || 'corporate',
      language: (req.query.lang as string) || 'en',
    };

    logger.info('API Request Started', {
      requestId,
      method: req.method,
      url: req.url,
      userAgent: context.userAgent,
      site: context.site,
      language: context.language,
    });

    try {
      // Method validation
      if (!config.allowedMethods.includes(req.method as HttpMethod)) {
        throw new UptickApiError('INVALID_PARAMETERS', `Method ${req.method} not allowed`, {
          allowedMethods: config.allowedMethods,
        });
      }

      monitor.checkpoint('method_validated');

      // Rate limiting (simplified - in production, use Redis or similar)
      if (config.rateLimit) {
        await checkRateLimit(context, config.rateLimit);
        monitor.checkpoint('rate_limit_checked');
      }

      // Extract and validate parameters
      const params = extractParams(req) as TParams;
      await withErrorHandling(() => handler.validate(params), context, 'parameter_validation');
      monitor.checkpoint('params_validated');

      // Execute handler
      const data = await withErrorHandling(
        () => handler.execute(params, context),
        context,
        'handler_execution'
      );
      monitor.checkpoint('handler_executed');

      // Create response metadata
      const meta: ResponseMeta = {
        requestId,
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
      };

      // Set cache headers
      if (config.cache?.enabled) {
        setCacheHeaders(res, config.cache);
      }

      // Set security headers
      setSecurityHeaders(res);

      // Log successful response
      const metrics = monitor.getMetrics();
      logger.info('API Request Completed', {
        requestId,
        processingTime: meta.processingTime,
        checkpoints: metrics.checkpoints,
      });

      // Send successful response
      const response: ApiResponse<TResponse> = {
        success: true,
        data,
        meta,
      };

      res.status(200).json(response);
    } catch (error) {
      // Handle errors
      const apiError = toApiError(error, context);
      const meta: ResponseMeta = {
        requestId,
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
      };

      // Set no-cache headers for errors
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

      logger.error('API Request Failed', {
        requestId,
        error: apiError,
        processingTime: meta.processingTime,
      });

      // Send error response
      const response: ApiResponse<never> = {
        success: false,
        error: apiError,
        meta,
      };

      res.status(apiError.statusCode).json(response);
    }
  };
}

/**
 * Extract parameters from request
 */
function extractParams(req: NextApiRequest): Record<string, unknown> {
  const params: Record<string, unknown> = {};

  // Query parameters
  Object.entries(req.query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      params[key] = value;
    } else if (typeof value === 'string') {
      // Try to parse comma-separated values
      if (value.includes(',')) {
        params[key] = value
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean);
      } else {
        params[key] = value;
      }
    } else {
      params[key] = value;
    }
  });

  // Body parameters (for POST/PUT requests)
  if (req.body && typeof req.body === 'object') {
    Object.assign(params, req.body);
  }

  return params;
}

/**
 * Get client IP address
 */
function getClientIpAddress(req: NextApiRequest): string {
  const xForwardedFor = req.headers['x-forwarded-for'];
  const xRealIp = req.headers['x-real-ip'];

  if (typeof xForwardedFor === 'string') {
    return xForwardedFor.split(',')[0].trim();
  }

  if (typeof xRealIp === 'string') {
    return xRealIp;
  }

  return req.socket.remoteAddress || 'unknown';
}

/**
 * Rate limiting check (simplified implementation)
 */
async function checkRateLimit(
  context: RequestContext,
  config: { maxRequests: number; windowMs: number }
): Promise<void> {
  // In production, this would use Redis or a proper rate limiting service
  // For now, this is a placeholder
  const rateLimitKey = `rate_limit:${context.ipAddress}`;

  // This is where you'd implement actual rate limiting logic
  // For example, using Redis with sliding window or token bucket algorithm

  logger.debug('Rate limit check', {
    requestId: context.requestId,
    key: rateLimitKey,
    config,
  });
}

/**
 * Set cache headers
 */
function setCacheHeaders(
  res: NextApiResponse,
  config: { ttl: number; staleWhileRevalidate?: number }
): void {
  const maxAge = Math.floor(config.ttl / 1000);
  const staleWhileRevalidate = config.staleWhileRevalidate
    ? Math.floor(config.staleWhileRevalidate / 1000)
    : maxAge;

  res.setHeader(
    'Cache-Control',
    `public, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`
  );
}

/**
 * Set security headers
 */
function setSecurityHeaders(res: NextApiResponse): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
}

// Get logger reference
const logger = getLogger();
