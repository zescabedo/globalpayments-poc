/**
 * Production-ready Content API
 * Fixed version that handles parameter validation properly
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createValidationError, createDataFetchError, UptickApiError, extractOriginalErrorDetails } from '@/lib/uptick/errors';
import { executeGraphQL } from '@/lib/graphql/fetchGraphQL';
import { GQL_LIST_BASE } from '@/lib/uptick/queries';
import { mapUptickItem } from '@/lib/uptick/mappers';
import { buildDynamicQueryForSearchService } from '@/utils/uptick/buildDynamicQuery';
import localDebug from '@/lib/_platform/logging/debug-log';

interface ContentQueryParams {
  readonly lang: string;
  readonly site: string;
  readonly query?: string;
  readonly types?: string[];
  readonly pageSize: number;
  readonly after?: string;
  readonly authorId?: string;
}

interface ContentResponse {
  content: unknown[];
  total: number;
  hasNext: boolean;
  after?: string;
}

/**
 * Content service - implements single responsibility principle
 */
class ContentService {
  async searchContent(params: ContentQueryParams): Promise<ContentResponse> {
    try {
      const graphqlVariables = {
        language: params.lang,
        after: params.after,
        first: params.pageSize,
      };

      const contentQuery = buildDynamicQueryForSearchService(GQL_LIST_BASE, {
        types: params.types,
        authorId: params.authorId,
      });

      const data = await executeGraphQL<{
        search: {
          results: unknown[];
          pageInfo: { hasNext: boolean; endCursor?: string };
          total: number;
        };
      }>(contentQuery, graphqlVariables);

      if (!data?.search) {
        throw createDataFetchError('Invalid GraphQL response structure');
      }

      const { results, pageInfo, total } = data.search;
      const content = results.map((item: unknown) => mapUptickItem(item, params.site));

      return {
        content,
        total,
        hasNext: pageInfo.hasNext,
        after: pageInfo.endCursor,
      };
    } catch (error) {
      throw createDataFetchError('Failed to fetch content from GraphQL', error);
    }
  }
}

/**
 * Parameter sanitization and validation
 */
function sanitizeAndValidateParams(req: NextApiRequest): ContentQueryParams {
  // Extract parameters with proper handling of `types` parameter
  const rawParams = {
    ...req.query,
    ...req.body,
  };

  // Handle the types parameter specifically (it might come as a string with curly braces)
  if (rawParams.types && typeof rawParams.types === 'string') {
    // Handle comma-separated GUIDs or other formats
    const typesString = rawParams.types.replace(/[{}]/g, ''); // Remove curly braces
    rawParams.types = typesString
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }

  // For now, do basic validation manually since the validation function might not work correctly
  const params: ContentQueryParams = {
    lang: (rawParams.lang as string) || 'en-US',
    site: (rawParams.site as string) || 'CorporateHeadless',
    pageSize: Number(rawParams.pageSize) || 12,
    after: (rawParams.after as string) || undefined,
    types: rawParams.types as string[], //todo read only string
    query: rawParams.query as string,
    authorId: rawParams.authorId as string,
  };

  // Basic validation
  if (params.pageSize < 1 || params.pageSize > 100) {
    throw createValidationError('Page size must be between 1 and 100');
  }

  if (!params.lang || !params.site) {
    throw createValidationError('Language and site parameters are required');
  }

  return params;
}

// Main API handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = performance.now();

  try {
    localDebug.uptickBff('[Content API] Request started: %o', {
      requestId,
      method: req.method,
      url: req.url,
      query: req.query,
    });

    // Only allow GET and POST methods
    if (!req.method || !['GET', 'POST'].includes(req.method)) {
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

    localDebug.uptickBff('[Content API] Parameters validated: %o', {
      requestId,
      params: {
        lang: params.lang,
        site: params.site,
        pageSize: params.pageSize,
        typesCount: params.types?.length || 0,
        hasQuery: !!params.query,
        hasAfter: !!params.after,
      },
    });

    // Execute business logic
    const contentService = new ContentService();
    const result = await contentService.searchContent(params);

    const processingTime = performance.now() - startTime;

    localDebug.uptickBff('[Content API] Request completed: %o', {
      requestId,
      resultsCount: result.content.length,
      total: result.total,
      hasNext: result.hasNext,
      processingTime,
    });

    // Return successful response
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
    const processingTime = performance.now() - startTime;
    
    const { originalMessage, originalStack } = extractOriginalErrorDetails(error as UptickApiError);

    localDebug.uptickBff.error('[Content API] Error occurred: %o', {
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
    } else if (apiError.message.includes('not found')) {
      statusCode = 404;
      errorCode = 'NOT_FOUND';
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
