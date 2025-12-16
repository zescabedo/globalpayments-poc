import type {
  FilterTag,
  FilterTags,
  QueryParamConfig,
  Result,
  SearchConditionInput,
  SelectedFilters,
} from '@/components/layout/SearchTagResults/SearchTagResults.type';
import type { ParsedUrlQuery } from 'querystring';

type FilterGroup = {
  OR: SearchConditionInput[];
};

type TaxonomyItem = {
  id?: string;
  name?: string;
  fields: { Slug: ValueField };
};

/**
 * Transforms selected filters into GraphQL-compatible filter groups
 */
export function transformSelectedFilters(selected: SelectedFilters): FilterGroup[] {
  const filters: FilterGroup[] = [];

  const pushFilter = (items: Map<string, FilterTag>, name: string) => {
    if (items.size > 0) {
      filters.push({
        OR: Array.from(items.values()).map<SearchConditionInput>((tag) => ({
          name,
          value: tag.value,
          operator: 'CONTAINS',
        })),
      });
    }
  };

  pushFilter(selected.contentTypes, 'contentType');
  pushFilter(selected.products, 'products');
  pushFilter(selected.topics, 'topics');

  return filters;
}

/**
 * Formats a single search condition for GraphQL query
 */
export function formatCondition({ name, value, operator }: SearchConditionInput): string {
  return `{
    name: ${JSON.stringify(name)}
    value: ${JSON.stringify(value)}
    operator: ${operator}
  }`;
}

/**
 * Builds dynamic WHERE blocks for GraphQL queries
 */
export function buildDynamicWhereBlocks(filters?: FilterGroup[]): string {
  if (!filters?.length) return '';

  return filters
    .map((group) => {
      const orItems = group.OR.map(formatCondition).join(',');
      return `{ OR: [${orItems}] }`;
    })
    .join(',');
}

/**
 * Extracts taxonomy items from search results
 */
export function extractFromItems(
  data: Result[],
  getItems: (item: Result) => TaxonomyItem | TaxonomyItem[] | undefined
): FilterTag[] {
  const map = new Map<string, { name: string; slug: string }>();

  for (const item of data) {
    const entries = getItems(item);
    if (!entries) continue;

    const list = Array.isArray(entries) ? entries : [entries];

    for (const entry of list) {
      if (entry?.id && entry?.name) {
        const name = entry.name || '';
        const slug = entry.fields?.Slug?.value || toSlug(name) || '';
        map.set(entry.id, { name, slug });
      }
    }
  }

  return Array.from(map, ([id, { name, slug }]) => ({
    value: id,
    name,
    slug,
  }));
}

/**
 * Extracts all filter tags from search results
 */
export function extractTags(data: Result[]): FilterTags {
  return {
    contentTypes: extractFromItems(data, (i) => i.contentType?.jsonValue),
    topics: extractFromItems(data, (i) => i.topics?.jsonValue),
    products: extractFromItems(data, (i) => i.products?.jsonValue),
  };
}

/**
 * Parses URL query parameters (handles both string and array formats)
 */
export function parseRepeatedParam(param: string | string[] | undefined): string[] {
  if (!param) return [];
  if (Array.isArray(param)) return param.map((p) => p.trim()).filter(Boolean);
  const trimmed = param.trim();
  return trimmed ? [trimmed] : [];
}

/**
 * Converts URL query parameters to SelectedFilters Map structure
 * Uses slugs from URL and matches them with FilterTags to get complete tag data
 */
export function selectedFromQuery(
  query: ParsedUrlQuery | Record<string, any>,
  filterTags?: FilterTags | null,
  config: QueryParamConfig = {}
): SelectedFilters {
  const contentTypeParam = config.contentTypeParam || 'types';
  const productParam = config.productParam || 'products';
  const topicParam = config.topicParam || 'topics';

  const result: SelectedFilters = {
    contentTypes: new Map(),
    products: new Map(),
    topics: new Map(),
  };

  if (!filterTags) {
    return result;
  }

  // Helper to find tag by slug
  const findTagBySlug = (tags: FilterTag[], slug: string): FilterTag | undefined => {
    return tags.find((tag) => tag.slug === slug);
  };

  // Process content types
  const typesSlugs = parseRepeatedParam(query[contentTypeParam]);
  typesSlugs.forEach((slug) => {
    const tag = findTagBySlug(filterTags.contentTypes || [], slug);
    if (tag) {
      result.contentTypes.set(tag.value, tag);
    }
  });

  // Process products
  const productsSlugs = parseRepeatedParam(query[productParam]);
  productsSlugs.forEach((slug) => {
    const tag = findTagBySlug(filterTags.products || [], slug);
    if (tag) {
      result.products.set(tag.value, tag);
    }
  });

  // Process topics
  const topicsSlugs = parseRepeatedParam(query[topicParam]);
  topicsSlugs.forEach((slug) => {
    const tag = findTagBySlug(filterTags.topics || [], slug);
    if (tag) {
      result.topics.set(tag.value, tag);
    }
  });

  return result;
}

/**
 * Converts SelectedFilters Map structure to URL query parameters
 * Extracts slugs from FilterTags to use in URL
 */
export function queryFromSelected(
  selected: SelectedFilters,
  config: QueryParamConfig = {}
): Record<string, string[] | undefined> {
  const contentTypeParam = config.contentTypeParam || 'types';
  const productParam = config.productParam || 'products';
  const topicParam = config.topicParam || 'topics';

  const fromMap = (m: Map<string, FilterTag>) =>
    m?.size ? Array.from(m.values()).map((tag) => tag.slug) : undefined;

  return {
    [contentTypeParam]: fromMap(selected.contentTypes),
    [topicParam]: fromMap(selected.topics),
    [productParam]: fromMap(selected.products),
  };
}

/**
 * Compares two SelectedFilters for equality
 */
export function areSelectedEqual(a: SelectedFilters, b: SelectedFilters): boolean {
  // Check if sizes are different
  if (
    a.contentTypes.size !== b.contentTypes.size ||
    a.products.size !== b.products.size ||
    a.topics.size !== b.topics.size
  ) {
    return false;
  }

  // Check if all keys in a exist in b with same values
  const checkMapEquality = (mapA: Map<string, FilterTag>, mapB: Map<string, FilterTag>) => {
    for (const [key, valueA] of mapA) {
      const valueB = mapB.get(key);
      if (!valueB || valueA.value !== valueB.value || valueA.slug !== valueB.slug) {
        return false;
      }
    }
    return true;
  };

  return (
    checkMapEquality(a.contentTypes, b.contentTypes) &&
    checkMapEquality(a.products, b.products) &&
    checkMapEquality(a.topics, b.topics)
  );
}

/**
 * Converts a string to URL-friendly slug format
 */
const toSlug = (str: string): string => str.toLowerCase().replace(/\s+/g, '-');
