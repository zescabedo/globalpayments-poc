/**
 * Authors Service - Single Responsibility Principle
 * Handles all author-related business logic
 */

import type { Author, AuthorQueryParams, GraphQLAuthorNode } from '../types';
import { withErrorHandling, createDataFetchError, createNotFoundError } from '../errors';
import { executeGraphQL } from '@/lib/graphql/fetchGraphQL';
import { GQL_AUTHORS_LIST, GQL_AUTHOR_BY_SLUG } from '@/lib/uptick/queries';
import { AuthorMapper } from '../mappers-refactored';

export interface IAuthorsService {
  /**
   * Fetch paginated list of authors
   */
  fetchAuthors(params: AuthorQueryParams): Promise<{
    authors: readonly Author[];
    total: number;
    hasNext: boolean;
    after?: string;
  }>;

  /**
   * Fetch single author by slug
   */
  fetchAuthorBySlug(slug: string, language: string): Promise<Author>;
}

export class AuthorsService implements IAuthorsService {
  constructor(private readonly mapper: AuthorMapper = new AuthorMapper()) {}

  async fetchAuthors(params: AuthorQueryParams): Promise<{
    authors: readonly Author[];
    total: number;
    hasNext: boolean;
    after?: string;
  }> {
    return withErrorHandling(async () => {
      const graphqlVariables = {
        language: params.lang,
        after: params.after,
        first: params.pageSize,
      };

      const data = await executeGraphQL<{
        search: {
          results: GraphQLAuthorNode[];
          pageInfo: { hasNext: boolean; endCursor?: string };
          total: number;
        };
      }>(GQL_AUTHORS_LIST, graphqlVariables);

      if (!data?.search) {
        throw createDataFetchError('Invalid GraphQL response structure');
      }

      const { results, pageInfo, total } = data.search;
      const authors = this.mapper.mapArray(results);

      return {
        authors,
        total,
        hasNext: pageInfo.hasNext,
        after: pageInfo.endCursor,
      };
    }, 'AuthorsService.fetchAuthors');
  }

  async fetchAuthorBySlug(slug: string, language: string): Promise<Author> {
    return withErrorHandling(async () => {
      const data = await executeGraphQL<{
        search: {
          results: GraphQLAuthorNode[];
        };
      }>(GQL_AUTHOR_BY_SLUG, { language, slug });

      const node = data?.search?.results?.[0];
      if (!node) {
        throw createNotFoundError('Author', slug);
      }

      return this.mapper.mapSingle(node);
    }, 'AuthorsService.fetchAuthorBySlug');
  }
}

// Default instance for dependency injection
export const authorsService = new AuthorsService();
