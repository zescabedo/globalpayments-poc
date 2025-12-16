/**
 * Production-ready mappers for Uptick data transformation
 * Implements proper type safety and error handling
 */

import type { Author, ContentItem } from './types';
import { createDataFetchError } from './errors';

// GraphQL response types
interface GraphQLAuthorNode {
  readonly id: string;
  readonly name?: string;
  readonly url?: {
    readonly path?: string;
  };
  readonly biography?: {
    readonly jsonValue?: string;
  };
  readonly photo?: {
    readonly src?: string;
    readonly jsonValue?: {
      readonly src?: string;
    };
  };
  readonly areaOfExpertise?: {
    readonly jsonValue?: ReadonlyArray<{
      readonly name?: string;
    }>;
  };
  readonly slug?: {
    readonly jsonValue?: string;
  };
}

interface GraphQLContentNode {
  readonly id: string;
  readonly url?: {
    readonly path?: string;
  };
  readonly contentTitle?: {
    readonly jsonValue?: string;
  };
  readonly contentSummary?: {
    readonly jsonValue?: string;
  };
  readonly contentPublishedDate?: {
    readonly jsonValue?: string;
  };
  readonly contentType?: {
    readonly jsonValue?: {
      readonly name?: string;
      readonly displayName?: string;
      readonly url?: string;
    };
  };
  readonly topics?: {
    readonly jsonValue?: ReadonlyArray<{
      readonly name?: string;
      readonly displayName?: string;
      readonly url?: string;
      readonly id?: string;
    }>;
  };
  readonly industries?: {
    readonly jsonValue?: ReadonlyArray<{
      readonly name?: string;
      readonly displayName?: string;
      readonly url?: string;
      readonly id?: string;
    }>;
  };
  readonly author?: {
    readonly jsonValue?: ReadonlyArray<{
      readonly id?: string;
      readonly name?: string;
      readonly slug?: string;
      readonly url?: string;
      readonly photo?: {
        readonly src?: string;
      };
    }>;
  };
  readonly contentMainImage?: {
    readonly src?: string;
    readonly jsonValue?: {
      readonly src?: string;
      readonly alt?: string;
    };
  };
  readonly contentCardImage?: {
    readonly src?: string;
    readonly jsonValue?: {
      readonly src?: string;
      readonly alt?: string;
    };
  };
  readonly slug?: {
    readonly jsonValue?: string;
  };
  readonly readTime?: {
    readonly jsonValue?: string;
  };
}

// Utility functions
class MappingUtils {
  static safeGet<T>(obj: unknown, path: string, defaultValue?: T): T | undefined {
    try {
      const keys = path.split('.');
      let current: unknown = obj;

      for (const key of keys) {
        if (current === null || current === undefined) {
          return defaultValue;
        }
        if (typeof current === 'object' && current !== null) {
          current = (current as Record<string, unknown>)[key];
        } else {
          return defaultValue;
        }
      }

      return typeof current === 'object' && current !== null && !Array.isArray(current)
        ? defaultValue
        : (current as T | undefined) ?? defaultValue;
    } catch {
      return defaultValue;
    }
  }

  static extractJsonValue<T>(field: { jsonValue?: T } | undefined): T | undefined {
    return field?.jsonValue;
  }

  static extractDisplayName(item: { displayName?: string; name?: string }): string {
    return item.displayName || item.name || '';
  }

  static extractSlugFromUrl(url?: string): string {
    if (!url) return '';

    try {
      return url.split('/').filter(Boolean).pop() || '';
    } catch {
      return '';
    }
  }

  static generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  static buildResponsiveSrcSet(
    baseSrc?: string,
    widths: readonly number[] = [320, 480, 640, 768, 1024, 1280, 1600]
  ): string | undefined {
    if (!baseSrc) return undefined;

    try {
      const url = new URL(baseSrc, 'https://example.com');

      return widths
        .map((width) => {
          const urlCopy = new URL(url.toString());
          urlCopy.searchParams.set('w', width.toString());
          return `${urlCopy.pathname}${urlCopy.search} ${width}w`;
        })
        .join(', ');
    } catch {
      return undefined;
    }
  }

  static normalizeImageData(imageField?: {
    src?: string;
    jsonValue?: {
      src?: string;
      alt?: string;
    };
  }): {
    url?: string;
    alt?: string;
    srcSet?: string;
  } {
    const directSrc = imageField?.src;
    const jsonValue = imageField?.jsonValue;
    const src = directSrc || jsonValue?.src;

    return {
      url: src,
      alt: jsonValue?.alt,
      srcSet: this.buildResponsiveSrcSet(src),
    };
  }
}

// Author mapper
export class AuthorMapper {
  static mapSingle(node: GraphQLAuthorNode): Author {
    try {
      const slug = this.extractSlug(node);
      const name = this.extractName(node);
      const areasOfExpertise = this.extractAreasOfExpertise(node);
      const photoUrl = this.extractPhotoUrl(node);
      const biography = this.extractBiography(node);

      return {
        id: node.id,
        slug,
        name,
        biography,
        photoUrl,
        areasOfExpertise,
        href: slug ? `/uptick/author/${slug}` : '#',
      };
    } catch (error) {
      throw createDataFetchError(`Failed to map author node with ID: ${node.id}`, error);
    }
  }

  static mapArray(nodes: readonly GraphQLAuthorNode[]): readonly Author[] {
    return nodes.map((node) => this.mapSingle(node));
  }

  private static extractSlug(node: GraphQLAuthorNode): string {
    // Try slug field first
    const explicitSlug = MappingUtils.extractJsonValue(node.slug);
    if (explicitSlug) return explicitSlug;

    // Extract from URL path
    const urlSlug = MappingUtils.extractSlugFromUrl(node.url?.path);
    if (urlSlug) return urlSlug;

    // Generate from name
    const name = node.name;
    if (name) return MappingUtils.generateSlug(name);

    // Fallback to ID
    return node.id;
  }

  private static extractName(node: GraphQLAuthorNode): string {
    return node.name || 'Unknown Author';
  }

  private static extractBiography(node: GraphQLAuthorNode): string | undefined {
    return MappingUtils.extractJsonValue(node.biography);
  }

  private static extractPhotoUrl(node: GraphQLAuthorNode): string | undefined {
    return node.photo?.src || node.photo?.jsonValue?.src;
  }

  private static extractAreasOfExpertise(node: GraphQLAuthorNode): readonly string[] {
    const expertise = MappingUtils.extractJsonValue(node.areaOfExpertise);

    if (!Array.isArray(expertise)) {
      return [];
    }

    return expertise
      .map((item) => item?.name)
      .filter((name): name is string => typeof name === 'string' && name.trim().length > 0);
  }
}

// Content mapper
export class ContentMapper {
  static mapSingle(node: GraphQLContentNode): ContentItem {
    try {
      const slug = this.extractSlug(node);
      const title = this.extractTitle(node);
      const summary = this.extractSummary(node);
      const publishedDate = this.extractPublishedDate(node);
      const contentType = this.extractContentType(node);
      const topics = this.extractTopics(node);
      const categories = this.extractCategories(node);
      const authors = this.extractAuthors(node);
      const mainImage = this.extractMainImage(node);
      const cardImage = this.extractCardImage(node);
      const readTime = this.extractReadTime(node);

      return {
        id: node.id,
        slug,
        title,
        summary,
        contentType: contentType.slug,
        contentTypeName: contentType.name,
        publishedDate,
        authors,
        topics: topics.map((t) => t.slug),
        topicsDisplay: topics.map((t) => t.name),
        categories: categories.map((c) => c.slug),
        categoriesDisplay: categories.map((c) => c.name),
        industries: [], // TODO: Add when available in schema
        mainImageUrl: mainImage.url,
        mainImageAlt: mainImage.alt,
        mainImageSrcSet: mainImage.srcSet,
        cardImageUrl: cardImage.url || mainImage.url,
        cardImageAlt: cardImage.alt || mainImage.alt,
        cardImageSrcSet: cardImage.srcSet || mainImage.srcSet,
        href: `/uptick/${slug}`,
        readTime,
      };
    } catch (error) {
      throw createDataFetchError(`Failed to map content node with ID: ${node.id}`, error);
    }
  }

  static mapArray(nodes: readonly GraphQLContentNode[]): readonly ContentItem[] {
    return nodes.map((node) => this.mapSingle(node));
  }

  private static extractSlug(node: GraphQLContentNode): string {
    // Try explicit slug field
    const explicitSlug = MappingUtils.extractJsonValue(node.slug);
    if (explicitSlug) return explicitSlug;

    // Extract from URL
    const urlSlug = MappingUtils.extractSlugFromUrl(node.url?.path);
    if (urlSlug) return urlSlug;

    // Fallback to ID
    return node.id;
  }

  private static extractTitle(node: GraphQLContentNode): string {
    return MappingUtils.extractJsonValue(node.contentTitle) || 'Untitled';
  }

  private static extractSummary(node: GraphQLContentNode): string | undefined {
    return MappingUtils.extractJsonValue(node.contentSummary);
  }

  private static extractPublishedDate(node: GraphQLContentNode): string | undefined {
    return MappingUtils.extractJsonValue(node.contentPublishedDate);
  }

  private static extractContentType(node: GraphQLContentNode): { slug: string; name: string } {
    const contentTypeData = MappingUtils.extractJsonValue(node.contentType);

    if (!contentTypeData) {
      return { slug: 'unknown', name: 'Unknown' };
    }

    const name = MappingUtils.extractDisplayName(contentTypeData);
    const slug =
      MappingUtils.extractSlugFromUrl(contentTypeData.url) || MappingUtils.generateSlug(name);

    return { slug, name };
  }

  private static extractTopics(node: GraphQLContentNode): Array<{ slug: string; name: string }> {
    const topics = MappingUtils.extractJsonValue(node.topics);

    if (!Array.isArray(topics)) {
      return [];
    }

    return topics
      .map((topic) => {
        const name = MappingUtils.extractDisplayName(topic);
        const slug = MappingUtils.extractSlugFromUrl(topic.url) || MappingUtils.generateSlug(name);
        return { slug, name };
      })
      .filter((topic) => topic.name.trim().length > 0);
  }

  private static extractCategories(
    node: GraphQLContentNode
  ): Array<{ slug: string; name: string }> {
    const industries = MappingUtils.extractJsonValue(node.industries);

    if (!Array.isArray(industries)) {
      return [];
    }

    return industries
      .map((industry) => {
        const name = MappingUtils.extractDisplayName(industry);
        const slug =
          MappingUtils.extractSlugFromUrl(industry.url) || MappingUtils.generateSlug(name);
        return { slug, name };
      })
      .filter((category) => category.name.trim().length > 0);
  }

  private static extractAuthors(node: GraphQLContentNode): readonly Author[] {
    const authors = MappingUtils.extractJsonValue(node.author);

    if (!Array.isArray(authors)) {
      return [];
    }

    return authors
      .filter((author): author is NonNullable<typeof author> => !!author)
      .map((author) => ({
        id: author.id || '',
        slug: author.slug || MappingUtils.extractSlugFromUrl(author.url) || '',
        name: author.name || 'Unknown Author',
        biography: undefined,
        photoUrl: author.photo?.src,
        areasOfExpertise: [],
        href: author.slug ? `/uptick/author/${author.slug}` : '#',
      }));
  }

  private static extractMainImage(node: GraphQLContentNode) {
    return MappingUtils.normalizeImageData(node.contentMainImage);
  }

  private static extractCardImage(node: GraphQLContentNode) {
    return MappingUtils.normalizeImageData(node.contentCardImage);
  }

  private static extractReadTime(node: GraphQLContentNode): string | undefined {
    return MappingUtils.extractJsonValue(node.readTime);
  }
}
