import type { SitecoreContextValue } from '@sitecore-jss/sitecore-jss-nextjs';
import { sites } from '@/utils/locales';

type UptickUrlKind =
  | 'home'
  | 'allContent'
  | 'content' // content listing with contenttype/topic/product filters
  | 'contentSlug' // content by slug
  | 'topic' // direct taxonomy topic page
  | 'product' // direct product taxonomy page
  | 'industry' // audience/industry taxonomy page
  | 'author' // single author page
  | 'authors' // authors listing page
  | 'sme' // single sme page
  | 'smes'; // authors listing page

type Primitive = string | number | boolean;
type Queryish = Record<string, Primitive | Primitive[] | undefined>;

export type UptickUrlConfig = {
  contentTypeQuerystringField: string; // e.g. "contenttype"
  topicQuerystringField: string; // e.g. "topic"
  productQuerystringField: string; // e.g. "product"
  breadcrumbOverrideLabelField: string; // e.g. "All Content"
  contentWildcard: string; // e.g. "/uptick/,-w-,"
  industryWildcard: string; // e.g. "/uptick/taxonomy/industry/,-w-,"
  allContentPage: string; // e.g. "/uptick/all-content"
  authorWildcard: string; // e.g. "/uptick/authors/,-w-,"
  uptickHomePage: string; // e.g. "/uptick"
  authorsListingPage: string; // e.g. "/uptick/authors"
  smeWildcard: string; // e.g. "/uptick/authors/,-w-,"
  smeListingPage: string; // e.g. "/uptick/authors",
  siteShowInID?: string | null;
};

type BuildArgs = {
  kind: UptickUrlKind;
  slug?: string; // for author/topic/product/industry etc
  // optional filters for content listing
  contentType?: string | string[];
  topic?: string | string[];
  product?: string | string[];
  // raw query to append
  query?: Queryish;
  // locale prefix like "en-au" → "/en-au/..."
  locale?: string;
  // provide either config directly or a sitecoreContext to read it from
  config?: UptickUrlConfig;
  sitecoreContext?: SitecoreContextValue;
};

function removeDefaultLanguageFromUrl(url: string, defaultLang?: string): string {
  if (!defaultLang || !url) return url;

  // Normalize language code to lowercase for case-insensitive matching (e.g., en-US -> en-us)
  const normalizedLang = defaultLang.toLowerCase();

  // Match /{lang}/ or /{lang} at the start of the URL
  // This handles both /en-us/insights and /en-US/insights
  const langRegex = new RegExp(`^/${normalizedLang}(/|$)`, 'i');

  if (langRegex.test(url)) {
    // Remove the language segment: /en-us/insights -> /insights
    return url.replace(langRegex, '/');
  }

  return url;
}

function stripDefaultLanguageFromConfig(
  config: UptickUrlConfig | undefined,
  defaultLang?: string
): UptickUrlConfig | undefined {
  if (!config || !defaultLang) return config;

  return {
    ...config,
    contentWildcard: removeDefaultLanguageFromUrl(config.contentWildcard, defaultLang),
    industryWildcard: removeDefaultLanguageFromUrl(config.industryWildcard, defaultLang),
    allContentPage: removeDefaultLanguageFromUrl(config.allContentPage, defaultLang),
    authorWildcard: removeDefaultLanguageFromUrl(config.authorWildcard, defaultLang),
    uptickHomePage: removeDefaultLanguageFromUrl(config.uptickHomePage, defaultLang),
    authorsListingPage: removeDefaultLanguageFromUrl(config.authorsListingPage, defaultLang),
    smeWildcard: removeDefaultLanguageFromUrl(config.smeWildcard, defaultLang),
    smeListingPage: removeDefaultLanguageFromUrl(config.smeListingPage, defaultLang),
  };
}

function getConfigFromContext(sc?: SitecoreContextValue): UptickUrlConfig | undefined {
  // Adjust this path to wherever you expose it in layout service
  // sc?.uptickConfiguration to keep it simple:
  const rawConfig = (sc as any)?.uptickConfiguration as UptickUrlConfig | undefined;

  // Get the site's default language from context
  const siteName = (sc as any)?.site?.name || 'CorporateHeadless';
  const currentSite = sites.find((site) => site.name === siteName);
  const defaultLang = currentSite?.defaultLanguage as string | undefined;

  // Strip default language from all config URLs if languageEmbedToDefaultLanguage is false
  const shouldStripDefaultLang = currentSite?.languageEmbedToDefaultLanguage === false;

  if (shouldStripDefaultLang && defaultLang) {
    return stripDefaultLanguageFromConfig(rawConfig, defaultLang);
  }

  return rawConfig;
}

function normalizePath(p: string): string {
  // collapse duplicate slashes, keep protocol-safe (we’re only handling paths here)
  return p.replace(/\/{2,}/g, '/').replace(/\/+$/, '') || '/';
}

function replaceWildcard(base: string, slug?: string): string {
  if (!slug) return normalizePath(base.replace(/[,/ ]?-w-[,/ ]?/g, '')); // no slug → strip token
  const encoded = encodeURIComponent(slug);
  // Replace any SXA wildcard token variations: "-w-", "/-w-/", ",-w-,"
  return normalizePath(base.replace(/[,/ ]?-w-[,/ ]?/g, `/${encoded}/`));
}

function toPairs(key: string, val?: string | string[]): [string, string][] {
  if (!val) return [];
  const arr = Array.isArray(val) ? val : [val];
  return arr.filter(Boolean).map((v) => [key, String(v)]);
}

export type AllContentQSParams = {
  cfg: UptickUrlConfig;
  topic?: string | string[];
  contentType?: string | string[];
  product?: string | string[];
  query?: Queryish;
};

function toAllContentWithQuerystringUrl({
  cfg,
  topic,
  contentType,
  product,
  query,
}: AllContentQSParams) {
  const base = cfg.allContentPage || '/';
  // build qs using configured keys
  const pairs: [string, string][] = [
    ...toPairs(cfg.contentTypeQuerystringField, contentType as any),
    ...toPairs(cfg.topicQuerystringField, topic as any),
    ...toPairs(cfg.productQuerystringField, product as any),
  ];
  const qs = buildQuery({
    ...(query || {}),
    ...Object.fromEntries(pairs),
  });

  return { _path: base, _qs: qs };
}

function buildQuery(params: Queryish | undefined): string {
  if (!params) return '';
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v == null) continue;
    if (Array.isArray(v)) {
      v.forEach((item) => {
        // Convert spaces to hyphens in the value before encoding
        const normalizedValue = String(item).replace(/\s+/g, '-');
        search.append(k, normalizedValue);
      });
    } else {
      // Convert spaces to hyphens in the value before encoding
      const normalizedValue = String(v).replace(/\s+/g, '-');
      search.set(k, normalizedValue);
    }
  }
  const s = search.toString();
  return s || '';
}

export function generateUptickUrls(
  { kind, slug, contentType, topic, product, query, locale, config, sitecoreContext }: BuildArgs,
  returnSeparated = false
): string | { href: string; querystring: string } {
  const cfg = config ?? getConfigFromContext(sitecoreContext);
  if (!cfg) {
    // fail-safe: return "/" so components don’t crash
    return '/';
  }

  let path = '/';
  let qs = '';

  switch (kind) {
    case 'home':
      path = cfg.uptickHomePage || '/';
      break;

    case 'allContent': {
      const { _path, _qs } = toAllContentWithQuerystringUrl({
        cfg,
        topic,
        contentType,
        product,
        query,
      });
      path = _path;
      qs = _qs;
      break;
    }

    case 'content': {
      path = replaceWildcard(cfg.contentWildcard || '/', slug);
      break;
    }

    case 'contentSlug':
      path = replaceWildcard(cfg.contentWildcard || '/', slug);
      break;

    case 'topic':
      {
        const { _path, _qs } = toAllContentWithQuerystringUrl({ cfg, topic: slug, query });
        path = _path;
        qs = _qs;
      }
      break;

    case 'product':
      {
        const { _path, _qs } = toAllContentWithQuerystringUrl({ cfg, product: slug, query });
        path = _path;
        qs = _qs;
      }
      break;

    case 'industry':
      path = replaceWildcard(cfg.industryWildcard || '/', slug);
      // Build query string with contentType, topic, product filters + additional query params
      const pairs: [string, string][] = [
        ...toPairs(cfg.contentTypeQuerystringField, contentType as any),
        ...toPairs(cfg.topicQuerystringField, topic as any),
        ...toPairs(cfg.productQuerystringField, product as any),
      ];
      qs = buildQuery({
        ...(query || {}),
        ...Object.fromEntries(pairs),
      });
      break;

    case 'author':
      path = replaceWildcard(cfg.authorWildcard || '/', slug);
      break;

    case 'authors':
      path = cfg.authorsListingPage || '/';
      break;

    case 'sme':
      path = replaceWildcard(cfg.smeWildcard || '/', slug);
      break;

    case 'smes':
      path = cfg.smeListingPage || '/';
      break;
  }

  // optional locale prefix
  if (locale) {
    path = normalizePath(`/${locale}/${path}`);
  }

  if (!returnSeparated) {
    return qs != '' ? normalizePath(`${path}?${qs}`) : normalizePath(path);
  }

  return { href: normalizePath(path), querystring: qs };
}

//Home
export function generateHomeUrl(sitecoreContext: SitecoreContextValue) {
  return generateUptickUrls({ kind: 'home', sitecoreContext });
}

//Authors Listing
export function generateAuthorsListingUrl(sitecoreContext: SitecoreContextValue) {
  return generateUptickUrls({ kind: 'authors', sitecoreContext });
}

//Author by slug Listing
export function generateAuthorUrl(
  authorSlug: string,
  sitecoreContextOrConfig: SitecoreContextValue | UptickUrlConfig,
  locale?: string
) {
  // Check if it's a config object or sitecore context
  const config =
    'contentTypeQuerystringField' in sitecoreContextOrConfig
      ? (sitecoreContextOrConfig as UptickUrlConfig)
      : undefined;

  const sitecoreContext = config ? undefined : (sitecoreContextOrConfig as SitecoreContextValue);

  return generateUptickUrls({
    kind: 'author',
    slug: authorSlug,
    sitecoreContext,
    config,
    locale,
  });
}

//SMEs Listing
export function generateSmesListingUrl(sitecoreContext: SitecoreContextValue) {
  return generateUptickUrls({ kind: 'smes', sitecoreContext });
}

//SME by slug Listing
export function generateSMEUrl(
  authorSlug: string,
  sitecoreContextOrConfig: SitecoreContextValue | UptickUrlConfig,
  locale?: string
) {
  // Check if it's a config object or sitecore context
  const config =
    'contentTypeQuerystringField' in sitecoreContextOrConfig
      ? (sitecoreContextOrConfig as UptickUrlConfig)
      : undefined;

  const sitecoreContext = config ? undefined : (sitecoreContextOrConfig as SitecoreContextValue);

  return generateUptickUrls({ kind: 'sme', slug: authorSlug, sitecoreContext, config, locale });
}

//Industry - Updated to support filtering params like allContent
export function generateIndustryUrl(
  industrySlug: string,
  sitecoreContextOrConfig: SitecoreContextValue | UptickUrlConfig,
  contentType?: string | string[],
  topic?: string | string[],
  product?: string | string[],
  query?: Queryish,
  locale?: string
) {
  const config =
    'contentTypeQuerystringField' in sitecoreContextOrConfig
      ? (sitecoreContextOrConfig as UptickUrlConfig)
      : undefined;

  const sitecoreContext = config ? undefined : (sitecoreContextOrConfig as SitecoreContextValue);

  return generateUptickUrls({
    kind: 'industry',
    slug: industrySlug,
    sitecoreContext,
    contentType,
    topic,
    product,
    query,
    config,
    locale,
  });
}

// Content
export function generateContentUrl(
  contentSlug: string,
  sitecoreContextOrConfig: SitecoreContextValue | UptickUrlConfig,
  locale?: string
) {
  const config =
    'contentTypeQuerystringField' in sitecoreContextOrConfig
      ? (sitecoreContextOrConfig as UptickUrlConfig)
      : undefined;

  const sitecoreContext = config ? undefined : (sitecoreContextOrConfig as SitecoreContextValue);

  return generateUptickUrls({
    kind: 'contentSlug',
    slug: contentSlug,
    sitecoreContext,
    config,
    locale,
  });
}

export function generateTopicUrl(
  topicSlug: string,
  sitecoreContext: SitecoreContextValue,
  withComponents = false
) {
  return generateUptickUrls({ kind: 'topic', slug: topicSlug, sitecoreContext }, withComponents);
}

export function generateProductUrl(
  productSlug: string,
  sitecoreContext: SitecoreContextValue,
  withComponents = false
) {
  return generateUptickUrls(
    { kind: 'product', slug: productSlug, sitecoreContext },
    withComponents
  );
}

//All Content
export function generateAllContentUrl(
  sitecoreContext: SitecoreContextValue,
  contentType?: string[],
  topic?: string[],
  product?: string[],
  returnSeparated = false
) {
  return generateUptickUrls(
    {
      kind: 'allContent',
      contentType: contentType,
      topic: topic,
      product: product,
      sitecoreContext,
    },
    returnSeparated
  );
}

// Add a function to get default config for server-side usage

export function getDefaultUptickConfig(): UptickUrlConfig {
  return {
    contentTypeQuerystringField: 'types',
    topicQuerystringField: 'topics',
    productQuerystringField: 'products',
    breadcrumbOverrideLabelField: 'All Content',
    contentWildcard: '/uptick/,-w-,',
    industryWildcard: '/uptick/taxonomy/industry/,-w-,',
    allContentPage: '/uptick/all-content',
    authorWildcard: '/uptick/authors/,-w-,',
    uptickHomePage: '/uptick',
    authorsListingPage: '/uptick/authors',
    smeWildcard: '/uptick/authors/,-w-',
    smeListingPage: '/uptick/authors',
  };
}
///Usages
/*const { sitecoreContext } = useSitecoreContext();
  const href = generateAuthorUrl({
    slug: 'amy-kistler',
  sitecoreContext, 
  });
*/
///
