/**
 * Production-ready Authors API
 * Fixed version that handles parameter validation properly
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createValidationError, createDataFetchError, UptickApiError, extractOriginalErrorDetails } from '@/lib/uptick/errors';
import { executeGraphQL } from '@/lib/graphql/fetchGraphQL';
import { GQL_AUTHORS_LIST } from '@/lib/uptick/queries';
import { mapAuthor } from '@/lib/uptick/mappers';
import localDebug from '@/lib/_platform/logging/debug-log';
import {
  buildDynamicQueryFetchForService,
  buildDynamicQueryForSearchService,
} from '@/utils/uptick/buildDynamicQuery';

interface AuthorQueryParams {
  readonly lang: string;
  readonly site: string;
  readonly pageSize: number;
  readonly after?: string;
  readonly isSME?: string;
}

interface Author {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly biography?: string;
  readonly photoUrl?: string;
  readonly areasOfExpertise: readonly string[];
}

interface AuthorsResponse {
  content: Author[];
  total: number;
  hasNext: boolean;
  after?: string;
}

/**
 * Authors service - implements single responsibility principle
 */
class AuthorsService {
  async fetchAuthors(params: AuthorQueryParams): Promise<AuthorsResponse> {
    try {
      const graphqlVariables = {
        language: params.lang,
        after: params.after,
        first: params.pageSize,
      };

      let authorListQuery = buildDynamicQueryForSearchService(GQL_AUTHORS_LIST, {
        isSME: params.isSME,
      });
      if (params.isSME) {
        authorListQuery = buildDynamicQueryFetchForService(authorListQuery, {
          isSME: params.isSME,
        });
      }

      const data = await executeGraphQL<{
        search: {
          results: unknown[];
          pageInfo: { hasNext: boolean; endCursor?: string };
          total: number;
        };
      }>(authorListQuery, graphqlVariables);

      if (!data?.search) {
        throw createDataFetchError('Invalid GraphQL response structure');
      }

      const { results, pageInfo, total } = data.search;

      localDebug.uptickBff('GraphQL authors response: %O', results);

      // Map the results to Author objects
      const content = results.map((item: unknown) => {
        localDebug.uptickBff('Mapping author item: %O', item);
        if (mapAuthor && typeof mapAuthor === 'function') {
          localDebug.uptickBff('Using mapAuthor function');
          return mapAuthor(item);
        } else {
          // Fallback mapping if mapAuthor is not available
          return {
            id: item.id,
            slug: item?.slug?.jsonValue || '',
            name: item?.name?.jsonValue || '',
            givenName: item?.givenName?.jsonValue || '',
            surname: item?.surname?.jsonValue || '',
            biography: item?.biography?.jsonValue,
            photoUrl: item?.photo?.src ?? item?.photo?.jsonValue?.src,
            areasOfExpertise:
              item?.areaOfExpertise?.jsonValue?.map((x: unknown) => String(x.name)) || [],
            isSME: (item?.isSME?.jsonValue as boolean) || false,
          };
        }
      });

      return {
        content,
        total,
        hasNext: pageInfo.hasNext,
        after: pageInfo.endCursor,
      };
    } catch (error) {
      throw createDataFetchError('Failed to fetch authors from GraphQL', error);
    }
  }
}

/**
 * Parameter sanitization and validation
 */
function sanitizeAndValidateParams(req: NextApiRequest): AuthorQueryParams {
  const rawParams = {
    ...req.query,
    ...req.body,
  };

  const params: AuthorQueryParams = {
    lang: (rawParams.lang as string) || 'en',
    site: (rawParams.site as string) || 'corporate',
    pageSize: Number(rawParams.pageSize) || 12,
    after: (rawParams.after as string) || undefined,
    isSME: (rawParams.isSME as string) || 'false',
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
    localDebug.uptickBff('[Authors API] Request started: %o', {
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

    localDebug.uptickBff('[Authors API] Parameters validated: %o', {
      requestId,
      params: {
        lang: params.lang,
        site: params.site,
        pageSize: params.pageSize,
        hasAfter: !!params.after,
        isSME: params.isSME,
      },
    });

    // Execute business logic
    const authorsService = new AuthorsService();
    const result = await authorsService.fetchAuthors(params);

    const processingTime = performance.now() - startTime;

    localDebug.uptickBff('[Authors API] Request completed: %o', {
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

    localDebug.uptickBff.error('[Authors API] Error occurred: %o', {
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
