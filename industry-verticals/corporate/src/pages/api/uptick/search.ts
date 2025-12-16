/**
 * Production-ready Search API
 * Fixed version that handles parameter validation properly
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createValidationError, createDataFetchError, UptickApiError, extractOriginalErrorDetails } from '@/lib/uptick/errors';
import { executeGraphQL } from '@/lib/graphql/fetchGraphQL';
import { GQL_LIST_BASE } from '@/lib/uptick/queries';
import { mapUptickItem } from '@/lib/uptick/mappers';
import { buildDynamicQueryForSearchService } from '@/utils/uptick/buildDynamicQuery';
import localDebug from '@/lib/_platform/logging/debug-log';

interface SearchQueryParams {
  readonly lang: string;
  readonly site: string;
  readonly pageSize: number;
  readonly after?: string;
  readonly types?: string[];
  readonly topics?: string[];
  readonly industries?: string[];
  readonly products?: string[];
  readonly showInId?: string;
  readonly query?: string;
}

interface SearchResponse {
  results: unknown[];
  total: number;
  hasNext: boolean;
  after?: string;
}

/**
 * Search service - implements single responsibility principle
 */
class SearchService {
  async globalSearch(params: SearchQueryParams): Promise<SearchResponse> {
    try {
      const graphqlVariables = {
        language: params.lang,
        after: params.after,
        first: params.pageSize,
      };

      const contentQuery = buildDynamicQueryForSearchService(GQL_LIST_BASE, {
        types: params.types,
        industries: params.industries,
        products: params.products,
        topics: params.topics,
        showInId: params.showInId,
        searchtext: params.query,
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
      const mappedResults = results.map((item: unknown) => mapUptickItem(item, params.site));

      return {
        results: mappedResults,
        total,
        hasNext: pageInfo.hasNext,
        after: pageInfo.endCursor,
      };
    } catch (error) {
      throw createDataFetchError('Failed to perform search', error);
    }
  }
}

/**
 * Parameter sanitization and validation
 */
function sanitizeAndValidateParams(req: NextApiRequest): SearchQueryParams {
  const rawParams = {
    ...req.query,
    ...req.body,
  };

  const params: SearchQueryParams = {
    lang: (rawParams.lang as string) || 'en',
    site: (rawParams.site as string) || 'corporate',
    query: (rawParams.query as string) || '',
    pageSize: Number(rawParams.pageSize) || 12,
    types: rawParams.types as string[], //todo read only string
    industries: rawParams.industries as string[], //todo read only string
    products: rawParams.products as string[], //todo read only string
    topics: rawParams.topics as string[], //todo read only string
    showInId: (rawParams.showInId as string) || undefined,
  };

  // Basic validation
  if (params.pageSize < 1 || params.pageSize > 100) {
    throw createValidationError('Page size must be between 1 and 100');
  }

  if (!params.lang || !params.site) {
    throw createValidationError('Language and site parameters are required');
  }

  if (!params.query || params.query.trim().length === 0) {
    throw createValidationError('Search query is required');
  }

  return params;
}

// Main API handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();

  try {
    localDebug.uptickBff('[Search API] Request started: %o', {
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

    localDebug.uptickBff('[Search API] Parameters validated: %o', {
      requestId,
      params: {
        lang: params.lang,
        site: params.site,
        pageSize: params.pageSize,
        queryLength: params.query.length,
        query: params.query,
        hasAfter: !!params.after,
        types: params.types,
        topics: params.topics,
        industries: params.industries,
        products: params.products,
        showInId: params.showInId,
      },
    });

    // Execute business logic
    const searchService = new SearchService();
    const result = await searchService.globalSearch(params);

    const processingTime = Date.now() - startTime;

    localDebug.uptickBff('[Search API] Request completed: %o', {
      requestId,
      resultsCount: result.results.length,
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
    const processingTime = Date.now() - startTime;

    const { originalMessage, originalStack } = extractOriginalErrorDetails(error as UptickApiError);

    localDebug.uptickBff.error('[Search API] Error occurred: %o', {
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
