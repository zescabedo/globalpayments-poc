/**
 * Content Service - Single Responsibility Principle
 * Handles all content-related business logic
 */

import type { ContentQueryParams } from '../types';
import { UptickItem } from '@/lib/uptick/mappers';
import { withErrorHandling, createDataFetchError, createNotFoundError } from '../errors';
import { executeGraphQL } from '@/lib/graphql/fetchGraphQL';
import { GQL_SEARCH_CONTENT, GQL_GET_BY_SLUG } from '@/lib/uptick/queries';
import { ContentMapper } from '../mappers-refactored';
import { configService } from '../config-refactored';

export interface IContentService {
  /**
   * Search content with filters
   */
  searchContent(params: ContentQueryParams): Promise<{
    content: readonly UptickItem[];
    total: number;
    hasNext: boolean;
    after?: string;
  }>;

  /**
   * Fetch single content by slug
   */
  fetchContentBySlug(slug: string, language: string, siteName: string): Promise<UptickItem>;

  /**
   * Fetch related content for a given content item
   */
  fetchRelatedContent(
    slug: string,
    language: string,
    siteName: string
  ): Promise<readonly UptickItem[]>;
}

export class ContentService implements IContentService {
  constructor(private readonly mapper = ContentMapper) {}

  async searchContent(params: ContentQueryParams): Promise<{
    content: readonly UptickItem[];
    total: number;
    hasNext: boolean;
    after?: string;
  }> {
    return withErrorHandling(async () => {
      const siteConfig = configService.getSiteConfig(params.site);

      const graphqlVariables = {
        language: params.lang,
        after: params.after,
        first: params.pageSize,
        showInId: siteConfig.id,
        searchText: params.query,
        contentTypes: params.contentTypes,
        authors: params.authors,
        tags: params.tags,
      };

      const data = await executeGraphQL<{
        search: {
          results: unknown[];
          pageInfo: { hasNext: boolean; endCursor?: string };
          total: number;
        };
      }>(GQL_SEARCH_CONTENT, graphqlVariables);

      if (!data?.search) {
        throw createDataFetchError('Invalid GraphQL response structure');
      }

      const { results, pageInfo, total } = data.search;
      const content = this.mapper.mapArray(results);

      return {
        content,
        total,
        hasNext: pageInfo.hasNext,
        after: pageInfo.endCursor,
      };
    });
  }

  async fetchContentBySlug(slug: string, language: string, siteName: string): Promise<UptickItem> {
    return withErrorHandling(async () => {
      const siteConfig = configService.getSiteConfig(siteName);

      let query = GQL_GET_BY_SLUG;
      if (siteConfig.id) {
        query = query.replace(
          '# { name: "showIn", value: $showInId, operator: CONTAINS }  # optional',
          '{ name: "showIn", value: $showInId, operator: CONTAINS }'
        );
      }

      const data = await executeGraphQL<{
        search: {
          results: unknown[];
        };
      }>(query, {
        language,
        slug,
        showInId: siteConfig.id,
      });

      const node = data?.search?.results?.[0];
      if (!node) {
        throw createNotFoundError('Content', slug);
      }

      return this.mapper.mapSingle(node);
    });
  }

  async fetchRelatedContent(
    slug: string,
    language: string,
    siteName: string
  ): Promise<readonly UptickItem[]> {
    return withErrorHandling(async () => {
      // First get the main content to extract tags/categories
      const mainContent = await this.fetchContentBySlug(slug, language, siteName);

      // Use tags and content type to find related content
      const relatedParams: ContentQueryParams = {
        lang: language,
        site: siteName,
        tags: mainContent.tags,
        contentTypes: [mainContent.contentType],
        pageSize: 6,
      };

      const { content } = await this.searchContent(relatedParams);

      // Filter out the current item and return only 5 related items
      return content.filter((item) => item.slug !== slug).slice(0, 5);
    });
  }
}

// Default instance for dependency injection
export const contentService = new ContentService();
