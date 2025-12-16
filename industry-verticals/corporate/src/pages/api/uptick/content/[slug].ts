/**
 * Production-ready Individual Content API
 * Fixed version that handles parameter validation properly
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createValidationError,
  createNotFoundError,
  createDataFetchError,
  UptickApiError,
  extractOriginalErrorDetails,
} from '@/lib/uptick/errors';
import { executeGraphQL } from '@/lib/graphql/fetchGraphQL';
import { GQL_GET_BY_SLUG } from '@/lib/uptick/queries';
import { mapUptickItem } from '@/lib/uptick/mappers';
import localDebug from '@/lib/_platform/logging/debug-log';

interface ContentParams {
  readonly slug: string;
  readonly lang: string;
}

interface Content {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly description?: string;
  readonly image?: string;
  readonly publishDate?: string;
  readonly category?: string;
  readonly authors: readonly string[];
  readonly tags: readonly string[];
}

interface ContentResponse {
  content: unknown;
}

/**
 * Individual Content service
 */
class IndividualContentService {
  async fetchContentBySlug(params: ContentParams): Promise<ContentResponse> {
    try {
      const data = await executeGraphQL<{
        search: {
          results: ReadonlyArray<unknown>;
        };
      }>(GQL_GET_BY_SLUG, {
        language: params.lang,
        slug: params.slug,
      });

      const node = data?.search?.results?.[0];
      if (!node) {
        throw createNotFoundError('Content', params.slug);
      }

      const { results } = data.search;
      const content = results.map((item: unknown) => mapUptickItem(item, ''));

      // Map the GraphQL node to our Content interface
      return {
        content,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error; // Re-throw not found errors
      }
      throw createDataFetchError('Failed to fetch content from GraphQL', error);
    }
  }
}

/**
 * Parameter sanitization and validation
 */
function sanitizeAndValidateParams(req: NextApiRequest): ContentParams {
  const { slug } = req.query as { slug: string };
  const language = (req.query.lang as string) || 'en';

  if (!slug || typeof slug !== 'string') {
    throw createValidationError('Content slug is required');
  }

  if (!language || typeof language !== 'string') {
    throw createValidationError('Language parameter is required');
  }

  return {
    slug: slug.trim(),
    lang: language,
  };
}

// Main API handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();

  try {
    localDebug.uptickBff('[Individual Content API] Request started: %o', {
      requestId,
      method: req.method,
      url: req.url,
      query: req.query,
    });

    // Only allow GET method
    if (!req.method || req.method !== 'GET') {
      return res.status(405).json({
        success: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: `Method ${req.method} not allowed`,
        },
      });
    }

    // Extract and validate parameters
    const params = sanitizeAndValidateParams(req);

    localDebug.uptickBff('[Individual Content API] Parameters validated: %o', {
      requestId,
      params: {
        slug: params.slug,
        lang: params.lang,
      },
    });

    // Execute business logic
    const service = new IndividualContentService();
    const result = await service.fetchContentBySlug(params);

    const processingTime = Date.now() - startTime;

    localDebug.uptickBff('[Individual Content API] Request completed: %o', {
      requestId,
      contentId: result.id,
      contentTitle: result.title,
      processingTime,
    });

    // Return successful response with caching headers
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({
      success: true,
      data: result,
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        processingTime,
      },
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;

    const { originalMessage, originalStack } = extractOriginalErrorDetails(error as UptickApiError);

    localDebug.uptickBff.error('[Individual Content API] Error occurred: %o', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      originalError: originalMessage ?? undefined,
      originalStack: originalStack ?? undefined,
      processingTime,
    });

    const apiError = error instanceof Error ? error : new Error('Unknown error');

    // Determine status code based on error type
    let statusCode = 500;
    let errorCode = 'INTERNAL_ERROR';

    if (apiError.message.includes('Invalid') || apiError.message.includes('validation')) {
      statusCode = 400;
      errorCode = 'VALIDATION_ERROR';
    } else if (
      apiError.message.includes('not found') ||
      apiError.message.includes('Content not found')
    ) {
      statusCode = 404;
      errorCode = 'NOT_FOUND';
      res.setHeader('Cache-Control', 'no-store');
    }

    return res.status(statusCode).json({
      success: false,
      error: {
        code: errorCode,
        message: apiError.message,
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        processingTime,
      },
    });
  }
}
