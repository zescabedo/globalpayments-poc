import { TaxonomyItem } from '@/components/Uptick/TaxonomyTags/TaxonomyTags.type';
import { ParsedUrlQuery } from 'querystring';

/**
 * Constructs a URL by properly appending a querystring to a base URL
 * @param baseHref The base URL (with or without existing query parameters)
 * @param querystring The querystring to append (may include leading ? or & characters)
 * @returns The properly constructed URL with sanitized querystring
 */
export const constructUrlWithQuerystring = (baseHref: string, querystring?: string): string => {
  if (!querystring) {
    return baseHref;
  }

  // Sanitize querystring by removing leading ? or & characters
  const cleanQuerystring = querystring.replace(/^[?&]+/, '');

  if (!cleanQuerystring) {
    return baseHref;
  }

  // Determine the appropriate separator
  const separator = baseHref.includes('?') ? '&' : '?';
  return `${baseHref}${separator}${cleanQuerystring}`;
};
/**
 * Constructs a full URL for the `/uptick/all-content` route
 * using the current window location as the base.
 * Optionally appends a query parameter with the given key and id.
 *
 * Examples (if running at http://localhost:3000):
 *   constructUptickUrlWithQuery("types", 123)
 *   -> "http://localhost:3000/uptick/all-content?types=123"
 *
 *   constructUptickUrlWithQuery("types")
 *   -> "http://localhost:3000/uptick/all-content"
 *
 * @param key The query parameter key (e.g., 'types' | 'topics' | 'industries' | 'industries')
 * @param id Optional query parameter value
 * @returns The full constructed URL
 */
export const constructUptickUrlWithQuery = (
  key: 'types' | 'topics' | 'industries' | 'products',
  id?: string | number
): string => {
  // Ensure we have an origin (SSR safety: window is undefined on server)
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const baseUrl = `${origin}/uptick/all-content`;

  // If id is not provided, return just the base URL
  if (id == null || id === '') {
    return baseUrl;
  }

  // Use URLSearchParams for safe query construction
  const query = new URLSearchParams({ [key]: String(id) });

  return `${baseUrl}?${query.toString()}`;
};

/**
 * Gets the last path segment from a URL.
 * Example: "https://example.com/foo/bar" -> "bar"
 */
export function getLastUrlPart(url: string): string {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    return parts.length > 0 ? parts[parts.length - 1] : '';
  } catch {
    // fallback if it's not a valid absolute URL (could be relative)
    const parts = url.split('/').filter(Boolean);
    return parts.length > 0 ? parts[parts.length - 1] : '';
  }
}

export const getFieldValue = (item: TaxonomyItem, fieldName: 'Title' | 'Slug'): string => {
  return item?.fields?.[fieldName]?.value || '';
};

export const getSlug = (item: TaxonomyItem): string => {
  const slug = getFieldValue(item, 'Slug');
  if (slug) return slug;

  // Fallback: convert displayName to slug format
  return (item?.displayName || '').toLowerCase().replace(/\s+/g, '-');
};

export const normalizeItem = (
  data: { jsonValue?: TaxonomyItem[] | TaxonomyItem } | TaxonomyItem | undefined
): TaxonomyItem | null => {
  if (!data) return null;

  // Check if it has jsonValue property
  if ('jsonValue' in data) {
    const jsonValue = data.jsonValue;
    // If jsonValue is an array, return first item
    if (Array.isArray(jsonValue)) {
      return jsonValue[0] || null;
    }
    // If jsonValue is a single object
    return jsonValue || null;
  }

  // It's already a single TaxonomyItem
  return data as TaxonomyItem;
};

/**
 * Validates if all filter slugs from query parameters exist in the valid slug sets
 * @param queryParams - URL query parameters
 * @param validSets - Sets of valid slugs for each filter category
 * @param paramNames - Names of query parameters for each filter type
 * @returns true if all slugs are valid or no filters present, false otherwise
 */
export const validateFilters = (
  queryParams: ParsedUrlQuery,
  validSets: { contentTypes: Set<string>; products: Set<string>; topics: Set<string> } | null,
  paramNames: { contentTypeParam: string; productParam: string; topicParam: string }
): boolean => {
  if (!validSets) return true;

  const { contentTypeParam, productParam, topicParam } = paramNames;

  // Helper to extract slugs from query params
  const getQuerySlugs = (param: string): string[] => {
    const value = queryParams[param];
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  };

  const contentTypeSlugs = getQuerySlugs(contentTypeParam);
  const productSlugs = getQuerySlugs(productParam);
  const topicSlugs = getQuerySlugs(topicParam);

  // Early return if no filters present
  if (contentTypeSlugs.length === 0 && productSlugs.length === 0 && topicSlugs.length === 0) {
    return true;
  }

  // Validate each category - fail fast on first invalid slug
  for (const slug of contentTypeSlugs) {
    if (!validSets.contentTypes.has(slug)) return false;
  }
  for (const slug of productSlugs) {
    if (!validSets.products.has(slug)) return false;
  }
  for (const slug of topicSlugs) {
    if (!validSets.topics.has(slug)) return false;
  }

  return true;
};

export const stripSitecorePrefix = (pathname: string, siteName?: string): string => {
  if (!siteName) return pathname;

  const prefix = `/_ssr/_site_${siteName}`;
  if (pathname.startsWith(prefix)) {
    return pathname.substring(prefix.length);
  }

  return pathname;
};

export const getCleanPathname = (asPath: string, siteName?: string): string => {
  let pathname = asPath.split('?')[0];

  if (siteName) {
    const ssrPrefix = `/_ssr/_site_${siteName}`;
    if (pathname.startsWith(ssrPrefix)) {
      pathname = pathname.substring(ssrPrefix.length);
    }
  }

  // Normalize slashes and remove trailing slash (except root)
  pathname = pathname.replace(/\/+/g, '/').replace(/\/$/, '');
  if (!pathname.startsWith('/')) pathname = '/' + pathname;

  return pathname || '/';
};

/**
 * Cleans internal Sitecore query params (path, sc_site, sc_lang, etc.)
 */
export const cleanInternalQueryParams = (query: ParsedUrlQuery): ParsedUrlQuery => {
  const cleaned = { ...query };
  delete cleaned.path;
  delete cleaned.sc_site;
  delete cleaned.sc_lang;
  delete cleaned.sc_itemid;
  delete cleaned.sc_mode;
  delete cleaned.sc_debug;
  return cleaned;
};

export const toQueryString = (query: Record<string, any>): string => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v !== undefined && v !== null && v !== '') {
          params.append(key, v);
        }
      });
    } else if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  return params.toString();
};

/**
 * Normalizes URL by ensuring it starts with a forward slash
 */
export const normalizeUrl = (url: string): string => {
  return url.startsWith('/') ? url : `/${url}`;
};

/**
 * Strips locale prefix from a path (e.g., "/en-US/path" -> "/path")
 */
export const stripLocalePrefix = (path: string, localePattern: RegExp): string => {
  return path.replace(localePattern, '') || '/';
};

/**
 * Extracts base path from wildcard URL pattern
 * e.g., "/en-us/uptick/,-w-," -> "uptick"
 */
export const extractBasePath = (wildcardUrl: string, basePathMatcher: RegExp): string | null => {
  const match = wildcardUrl.match(basePathMatcher);
  return match ? match[1] : null;
};

/**
 * Resolves wildcard URL by replacing ,-w-, placeholder with actual path
 */
export const resolveWildcardUrl = (
  wildcardUrl: string,
  currentPath: string,
  wildcardPlaceholder: string,
  localePattern: RegExp,
  basePathMatcher: RegExp
): string => {
  const pathWithoutLocale = stripLocalePrefix(currentPath, localePattern);
  const basePath = extractBasePath(wildcardUrl, basePathMatcher);

  if (basePath && pathWithoutLocale.startsWith(`/${basePath}`)) {
    // Extract the dynamic part after the base path
    const dynamicPath = pathWithoutLocale.substring(basePath.length + 1);
    // Replace the entire "basePath/,-w-," pattern with "basePath/dynamicPath"
    return wildcardUrl.replace(`${basePath}/${wildcardPlaceholder}`, `${basePath}${dynamicPath}`);
  }

  // Fallback: replace wildcard with the entire path without locale
  return wildcardUrl.replace(new RegExp(wildcardPlaceholder, 'g'), pathWithoutLocale);
};

/** File extensions that should trigger a download when clicked */
const DOWNLOADABLE_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar', '7z', 'csv'];

/**
 * Checks if a URL points to a downloadable file based on its extension
 * @param url - The URL to check
 * @returns true if the URL ends with a downloadable file extension
 */
export const isDownloadableUrl = (url: string | undefined | null): boolean => {
  if (!url) return false;

  const extensionPattern = new RegExp(`\\.(${DOWNLOADABLE_EXTENSIONS.join('|')})$`, 'i');
  return extensionPattern.test(url);
};
