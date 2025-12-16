/**
 * Search Service - Single Responsibility Principle
 * Handles all search-related business logic
 */

import type { SearchQueryParams } from '../types';
import { withErrorHandling, createDataFetchError } from '../errors';
import { executeGraphQL } from '@/lib/graphql/fetchGraphQL';
import { GQL_SEARCH } from '@/lib/uptick/queries';

export interface ISearchService {
  /**
   * Global search across all content types
   */
  globalSearch(params: SearchQueryParams): Promise<{
    results: readonly unknown[];
    total: number;
    hasNext: boolean;
    after?: string;
  }>;
}

export class SearchService implements ISearchService {
  async globalSearch(params: SearchQueryParams): Promise<{
    results: readonly unknown[];
    total: number;
    hasNext: boolean;
    after?: string;
  }> {
    return withErrorHandling(async () => {
      const graphqlVariables = {
        language: params.lang,
        after: params.after,
        first: params.pageSize,
        searchText: params.query,
      };

      const data = await executeGraphQL<{
        search: {
          results: unknown[];
          pageInfo: { hasNext: boolean; endCursor?: string };
          total: number;
        };
      }>(GQL_SEARCH, graphqlVariables);

      if (!data?.search) {
        throw createDataFetchError('Invalid GraphQL response structure');
      }

      const { results, pageInfo, total } = data.search;

      return {
        results,
        total,
        hasNext: pageInfo.hasNext,
        after: pageInfo.endCursor,
      };
    });
  }
}

// Default instance for dependency injection
export const searchService = new SearchService();
