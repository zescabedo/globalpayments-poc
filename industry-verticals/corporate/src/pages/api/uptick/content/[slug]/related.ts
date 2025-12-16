/**
 * Production-ready Related Content API
 * Fixed version that handles parameter validation properly
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createValidationError,
  createNotFoundError,
  createDataFetchError,
} from '@/lib/uptick/errors';
import { executeGraphQL } from '@/lib/graphql/fetchGraphQL';
import { GQL_GET_BY_SLUG, GQL_LIST_BASE } from '@/lib/uptick/queries';
import { mapUptickItem, UptickItem } from '@/lib/uptick/mappers';
import { SITE_IDS } from '@/lib/uptick/config';
import localDebug from '@/lib/_platform/logging/debug-log';
import { buildDynamicQueryForSearchService } from '@/utils/uptick/buildDynamicQuery';

interface RelatedContentParams {
  readonly slug: string;
  readonly site: string;
  readonly lang: string;
  readonly limit: number;
  readonly match: 'any' | 'all';
  readonly contentTypeIds: string[];
}

/**
 * Related Content service
 */
class RelatedContentService {
  async fetchRelatedContent(params: RelatedContentParams): Promise<readonly UptickItem[]> {
    try {
      //const showInId = SITE_IDS[params.site];

      // 1) Load base item to get topics and industries
      const baseData = await executeGraphQL<{
        search: {
          results: ReadonlyArray<unknown>;
        };
      }>(GQL_GET_BY_SLUG, {
        language: params.lang,
        //siteName: params.site,
        slug: params.slug,
        //showInId,
      });

      const baseNode = baseData?.search?.results?.[0];
      if (!baseNode) {
        throw createNotFoundError('Content', params.slug);
      }

      const nodeData = baseNode as Record<string, unknown>;

      // Extract topics and industries from base content
      const topics: string[] =
        ((nodeData?.topics as Record<string, unknown>)?.jsonValue as ReadonlyArray<unknown>)?.map(
          (s: unknown) => String(s.id).toLowerCase()
        ) || [];

      const industries: string[] =
        (
          (nodeData?.industries as Record<string, unknown>)?.jsonValue as ReadonlyArray<unknown>
        )?.map((s: unknown) => String(s.id).toLowerCase()) || [];

      localDebug.uptickBff('[Related Content API] Topics Industries: %o', {
        topcis: topics,
        industries: industries,
      });

      // 2) Build dynamic query for related content
      const dynamicQuery = buildDynamicQueryForSearchService(GQL_LIST_BASE, {
        types: params.contentTypeIds,
        topics,
        industries,
        //showInId,
        match: params.match,
      });

      // 3) Execute related content query (fetch one extra, then exclude base)
      const relatedData = await executeGraphQL<{
        search: {
          results: ReadonlyArray<unknown>;
        };
      }>(dynamicQuery, {
        language: params.lang,
        after: null,
        first: params.limit + 1,
      });

      // Map and filter results
      const items: UptickItem[] = (relatedData?.search?.results || [])
        .map((node: unknown) => mapUptickItem(node, params.site))
        .filter((item) => item.slug !== params.slug)
        .slice(0, params.limit);

      return items;
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error; // Re-throw not found errors
      }
      throw createDataFetchError('Failed to fetch related content from GraphQL', error);
    }
  }
}

/**
 * Parameter sanitization and validation
 */
function sanitizeAndValidateParams(req: NextApiRequest): RelatedContentParams {
  const { slug } = req.query as { slug: string };
  const site = ((req.query.site as string) || 'corporate').toLowerCase();
  const language = (req.query.lang as string) || 'en';
  const limitParam = (req.query.limit as string) || '6';
  const match = (req.query.match as string) === 'all' ? 'all' : 'any';
  const typesParam = req.query.types;

  if (!slug || typeof slug !== 'string') {
    throw createValidationError('Content slug is required');
  }

  if (!site || typeof site !== 'string') {
    throw createValidationError('Site parameter is required');
  }

  if (!language || typeof language !== 'string') {
    throw createValidationError('Language parameter is required');
  }

  const limit = Math.min(parseInt(limitParam, 10) || 6, 24);
  if (isNaN(limit) || limit < 1) {
    throw createValidationError('Limit must be a positive number');
  }

  // Parse content type IDs
  const contentTypeIds = (Array.isArray(typesParam) ? typesParam.join(',') : typesParam || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    slug: slug.trim(),
    site,
    lang: language,
    limit,
    match,
    contentTypeIds,
  };
}

// Main API handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();

  try {
    localDebug.uptickBff('[Related Content API] Request started: %o', {
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

    localDebug.uptickBff('[Related Content API] Parameters validated: %o', {
      requestId,
      params: {
        slug: params.slug,
        site: params.site,
        lang: params.lang,
        limit: params.limit,
        match: params.match,
        contentTypeIds: params.contentTypeIds,
      },
    });

    // Execute business logic
    const service = new RelatedContentService();
    const result = await service.fetchRelatedContent(params);

    const processingTime = Date.now() - startTime;

    localDebug.uptickBff('[Related Content API] Request completed: %o', {
      requestId,
      relatedCount: result.length,
      processingTime,
    });

    // Return successful response with caching headers
    res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
    return res.status(200).json({
      success: true,
      data: result,
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        processingTime,
        count: result.length,
      },
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;

    localDebug.uptickBff.error('[Related Content API] Error occurred: %o', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
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

    // For related content, fallback to empty array on errors to maintain UI stability
    const fallbackResponse = statusCode === 404 ? [] : null;

    return res.status(statusCode).json({
      success: false,
      data: fallbackResponse,
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
