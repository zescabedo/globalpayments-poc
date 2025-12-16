// --- utils.ts ---
import { AuthorCardFields } from '@/components/Uptick/AuthorCard.types';
import { CardFields } from '@/components/Uptick/CardList/Card.types';
import {
  generateAuthorUrl,
  generateIndustryUrl,
  generateProductUrl,
  generateSMEUrl,
  generateTopicUrl,
} from '@/utils/uptick/linkResolver';
import { LinkFieldValue, SitecoreContextValue } from '@sitecore-jss/sitecore-jss-nextjs';
import { UptickTaxonomyItem } from '@/components/Uptick/UptickTaxonomy.types';

type MediaValue = {
  src?: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
};

export type ContentTaxonomy = {
  id?: string;
  slug: string;
  name: string;
  kind?: string;
};

export type TaxonomyItem = {
  type: 'audience' | 'topic';
  name: { value: string };
  link: { value: { href: string } };
  isFeatured: boolean;
  slug: string;
  display?: string;
};

const get = (obj: unknown, path: string, def?: unknown) => {
  try {
    return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj) ?? def;
  } catch {
    return def;
  }
};

// Unwraps GraphQL fields that come back as { jsonValue: { value: ... } }
const val = (node: unknown, path: string, def?: unknown) => {
  const v = get(node, path);
  if (v && typeof v === 'object' && 'value' in v) return v.value ?? def;
  return v ?? def;
};

/**
 * Safely extracts string value from Sitecore field that may have different formats:
 * - Direct string: "text"
 * - Field format: { value: "text" }
 * - JSON format: { jsonValue: { value: "text" } }
 * - Object without value property: returns empty string to avoid [object Object]
 *
 * @param field - The field value to extract
 * @param defaultValue - Default value if field is empty/null/undefined (default: '')
 * @returns Clean string value or default
 */
export const extractFieldValue = (field: unknown, defaultValue: string = ''): string => {
  // Handle null/undefined
  if (field == null) return defaultValue;

  // Already a string
  if (typeof field === 'string') return field.trim() || defaultValue;

  // Handle object formats
  if (typeof field === 'object') {
    // Check for { jsonValue: { value: "text" } }
    if ('jsonValue' in field && field.jsonValue && typeof field.jsonValue === 'object') {
      if ('value' in field.jsonValue) {
        const val = field.jsonValue.value;
        return typeof val === 'string' ? val.trim() || defaultValue : defaultValue;
      }
    }

    // Check for { value: "text" }
    if ('value' in field) {
      const val = field.value;
      return typeof val === 'string' ? val.trim() || defaultValue : defaultValue;
    }

    // Object without recognized structure - return default to avoid [object Object]
    return defaultValue;
  }

  // Number or boolean - convert to string
  return String(field);
};

// Turn "name/displayName/fields.Title" into a printable name
const pickDisplayName = (obj: unknown): string =>
  obj?.displayName || obj?.name || obj?.fields?.Title?.value || obj?.fields?.Title || '';

// Extract a stable slug from a Sitecore item URL (/uptick/taxonomy/topics/foo-bar -> foo-bar)
const slugFromUrl = (url?: string): string => (url || '').split('/').filter(Boolean).pop() || '';

const kindFromUrl = (url?: string): string => {
  if (!url) {
    return '';
  }
  url = url.toLocaleLowerCase();
  if (url?.indexOf('industries') > -1) {
    return 'industry';
  }
  if (url?.indexOf('topics') > -1) {
    return 'topics';
  }
  if (url?.indexOf('products') > -1) {
    return 'products';
  }
  return '';
};
// Build a responsive srcset from a Sitecore media URL.
// Works with either absolute src (e.g., https://.../-/media/...) or relative "/-/media/..."
// Keeps existing query params and overrides width (w=) per candidate.
const buildSrcSet = (
  src?: string,
  widths: number[] = [320, 480, 640, 768, 1024, 1280, 1600, 2000]
): string | undefined => {
  if (!src) return undefined;
  try {
    // Support relative media paths too by faking a base (URL needs an origin)
    const u = new URL(src, 'https://example.local');
    return widths
      .map((w) => {
        const u2 = new URL(u.toString());
        // Preserve existing params, just set width
        u2.searchParams.set('w', String(w));
        // Many Sitecore handlers accept "h" but we let it auto-compute to keep aspect
        return `${u2.pathname}${u2.search} ${w}w`;
      })
      .join(', ');
  } catch {
    return undefined;
  }
};

const normalizeMedia = (
  node: unknown,
  basePath: string
): { url?: string; alt?: string; srcSet?: string } => {
  // Prefer top-level absolute src if present (your API shows this for main image)
  const absoluteSrc: string | undefined = get(node, `${basePath}.src`);
  const rawValue: MediaValue | undefined = val(node, `${basePath}.jsonValue`, {});
  const valueSrc: string | undefined =
    typeof rawValue === 'object' ? (rawValue.src as string) : undefined;
  const alt: string | undefined =
    (typeof rawValue === 'object' ? (rawValue.alt as string) : undefined) || undefined;

  const src = absoluteSrc || valueSrc;
  const srcSet = buildSrcSet(src);

  return { url: src, alt, srcSet };
};

export type Taxo = { id?: string; slug: string; name: string; kind?: string };
const normalizeArrayTaxonomy = (arr: unknown[]): Taxo[] =>
  (arr || [])
    .map((x) => {
      const name = pickDisplayName(x);
      const slug = slugFromUrl(x?.url);
      return {
        id: x?.id,
        slug: slug.toLowerCase(),
        name,
        kind: kindFromUrl(x?.url),
      };
    })
    .filter((x) => x.slug);

// --- mapper.ts ---
export type AuthorRef = {
  id?: string;
  slug?: string;
  url?: string;
  name: string;
  biography?: string;
  photoUrl?: string;
  photoUrlSrcSet?: string;
  displayName?: string;
  areasOfExpertise?: string[];
  areasOfExpertiseDisplay?: string[];
  areasOfExpertiseObject?: ContentTaxonomy[];
  isSME?: boolean;
  longBiographyTitle?: string;
  longBiographySubtitle?: string;
  longBiographyContent?: string;
};

export type UptickItem = {
  id: string;
  slug: string;
  path?: string;
  title?: string;
  summary?: string;
  contentType?: string; // "podcast"
  contentTypeName?: string; // "Podcast" (for chip)
  tags: string[]; // if you add tags later
  topics: Taxo[]; // topics  with slugs and display names
  topicsSlugs: string[]; // slugs
  topicsDisplay: string[]; // labels
  industries: Taxo[]; // from industries -> slugs
  industriesSlugs: string[];
  industriesDisplay: string[]; // labels\
  products: Taxo[]; // from industries -> slugs
  productsSlugs: string[];
  productsDisplay: string[]; // labels\
  publishedDate?: string;
  authors: AuthorRef[];
  mainImageUrl?: string;
  mainImageAlt?: string;
  mainImageSrcSet?: string;
  cardImageUrl?: string;
  cardImageAlt?: string;
  cardImageSrcSet?: string;
  href?: string;
  primaryCTA: LinkFieldValue;
  readTime?: string; // e.g., "4 mins"
};

export function mapUptickItem(node: unknown, siteName: string): UptickItem {
  // Simple fields - use extractFieldValue for safe string extraction
  const title: string = extractFieldValue(
    get(node, 'contentTitle') || get(node, 'name'),
    ''
  );
  const summary: string = extractFieldValue(
    get(node, 'contentSummary') || get(node, 'summary'),
    ''
  );
  const published: string = extractFieldValue(
    get(node, 'contentPublishedDate'),
    ''
  );
  const readTime: string = extractFieldValue(
    get(node, 'readTime') || get(node, 'Read Time'),
    ''
  );

  // Content Type object -> slug + label
  const ctypeObj = val(node, 'contentType.jsonValue') || get(node, 'contentType');
  const primaryCTAObj = (val(node, 'primaryCTA.jsonValue') ?? { href: '' }) as LinkFieldValue;
  const contentTypeSlug =
    slugFromUrl(ctypeObj?.url).toLowerCase() || pickDisplayName(ctypeObj)?.toLowerCase();
  const contentTypeName = pickDisplayName(ctypeObj) || contentTypeSlug;

  // Taxonomies
  const topicsArr = val(node, 'topics.jsonValue') || [];
  const indsutriesArr = val(node, 'industries.jsonValue') || []; // you labeled this "industries"
  const productsArr = val(node, 'productsArr.jsonValue') || []; // you labeled this "industries"
  const topicsNorm = normalizeArrayTaxonomy(topicsArr);
  const industriesNorm = normalizeArrayTaxonomy(indsutriesArr);
  const productsArrNorm = normalizeArrayTaxonomy(productsArr);

  // Images (with fallback Card <- Main)
  const mainImg = normalizeMedia(node, 'contentMainImage');
  let cardImg = normalizeMedia(node, 'contentCardImage');
  if (!cardImg.url) cardImg = mainImg;

  // Slug
  const slug =
    val(node, 'slug.jsonValue') ||
    get(node, 'url.path')?.split('/').filter(Boolean).pop() ||
    node.id;

  // Authors (array)
  const authorsRaw = val(node, 'author.jsonValue') || [];
  const authors: AuthorRef[] = (Array.isArray(authorsRaw) ? authorsRaw : [authorsRaw]).map((a) => ({
    id: a?.id || a?.value || a?.name,
    slug: a?.slug || slugFromUrl(a?.url) || a?.name,
    name: pickDisplayName(a) || 'Author',
    photoUrl: a?.photo?.src,
  }));

  return {
    id: node.id,
    slug,
    path: node?.url?.path,
    title,
    summary,
    contentType: contentTypeSlug,
    contentTypeName,
    tags: [],
    topics: topicsNorm,
    topicsSlugs: topicsNorm.map((t) => t.slug),
    topicsDisplay: topicsNorm.map((t) => t.name),
    industries: industriesNorm,
    industriesSlugs: industriesNorm.map((c) => c.slug),
    industriesDisplay: industriesNorm.map((c) => c.name),
    products: productsArrNorm,
    productsSlugs: productsArrNorm.map((c) => c.slug), // map when you expose it
    productsDisplay: productsArrNorm.map((c) => c.name),
    publishedDate: published,
    authors,
    mainImageUrl: mainImg.url,
    mainImageAlt: mainImg.alt,
    mainImageSrcSet: mainImg.srcSet,
    cardImageUrl: cardImg.url,
    cardImageAlt: cardImg.alt,
    cardImageSrcSet: cardImg.srcSet,
    primaryCTA: primaryCTAObj,
    href: `/insights/${slug}`, // TODO: make this dynamic
    readTime: readTime,
  };
}

export function mapUptickItems(data: unknown, siteName: string): UptickItem[] {
  const results = get(data, 'results', []) || get(data, 'data.search.results', []);
  if (!Array.isArray(results)) return [];
  return results.map((r) => mapUptickItem(r, siteName));
}

export function mapUptickToCardFields(
  mapped: UptickItem,
  sitecoreContext: SitecoreContextValue
): CardFields {
  const imgUrl = mapped.cardImageUrl || mapped.mainImageUrl || '';
  const imgAlt = mapped.cardImageUrl ? mapped.cardImageAlt : mapped.mainImageAlt;
  const imgSrcSet = mapped.cardImageUrl ? mapped.cardImageSrcSet : mapped.mainImageSrcSet;

  const topics = mapped.topics || [];
  //const topicsDisplay = mapped.topicsDisplay || [];
  const industries = mapped.industries || [];
  //const industriesDisplay = mapped.industriesDisplay || [];

  // Final list: up to two items, with the fallback behavior baked in
  const taxonomies = makeTaxonomyListToDiplay(industries, topics, sitecoreContext);
  const rawContentReadTime = mapped.readTime || '';

  const card: CardFields = {
    id: mapped.id,
    title: { value: mapped.title || '' },
    description: { value: mapped.summary || '' },
    image: {
      value: {
        src: imgUrl,
        alt: imgAlt || mapped.title || '',
        srcset: imgSrcSet,
      },
    },
    contentListingUrl: {
      value: {
        href: mapped.href || mapped.path || '#',
        text: mapped.title || '',
      },
    },
    authorNameTag: 'h3',
    authors: mapped?.authors ?? [],
    summary: mapped?.summary ?? '',
    topics: mapped?.topics ?? [],
    primaryCTA: mapped?.primaryCTA ?? null,
    industries: mapped?.industries ?? [],
    publishedDate: { jsonValue: { value: mapped.publishedDate ?? '' } },
    contentType: { jsonValue: { value: mapped.contentTypeName || mapped.contentType || '' } },
    showContentListingLink: true,
    taxonomies,
    slug: mapped?.slug || '',
    readTime: { jsonValue: { value: rawContentReadTime } },
  };

  return card;
}

export function mapAuthor(a: unknown): AuthorRef {
  const slug =
    val(a, 'slug.jsonValue') || get(a, 'url.path')?.split('/').filter(Boolean).pop() || a.id;
  const areaOfExpertise = val(a, 'areaOfExpertise.jsonValue') || [];
  const areaOfExpertiseNorm = normalizeArrayTaxonomy(areaOfExpertise);
  const authorImg = normalizeMedia(a, 'photo');
  const isSME = val(a, 'isSME.jsonValue') || false;

  return {
    id: a.id,
    slug: slug,
    name: a.name,
    givenName: extractFieldValue(a.givenName),
    surname: extractFieldValue(a.surname),
    biography: extractFieldValue(a?.biography),
    photoUrl: authorImg?.url,
    photoUrlSrcSet: authorImg?.srcSet,
    displayName: a.fields?.displayName?.value,
    url: slug ? `/insights/authors/${slug}` : undefined, //Regenerated at component level with context
    areasOfExpertise: areaOfExpertiseNorm.map((t) => t.slug),
    areasOfExpertiseDisplay: areaOfExpertiseNorm.map((t) => t.name),
    areasOfExpertiseObject: areaOfExpertiseNorm,
    isSME: isSME,
    longBiographyTitle: extractFieldValue(a?.longBiographyTitle),
    longBiographySubtitle: extractFieldValue(a?.longBiographySubtitle),
    longBiographyContent: extractFieldValue(a?.longBiographyContent),
  };
}

export function mapAuthorToAuthorFields(
  mapped: AuthorRef,
  sitecoreContext: SitecoreContextValue
): AuthorCardFields {
  const imgUrl = mapped.photoUrl || '';
  const imgAlt = mapped.name;

  const taxonomies = makeAuthorTaxonomyListToDiplay(
    mapped.areasOfExpertiseObject || [],
    sitecoreContext
  );

  const authOrUrl = mapped.slug
    ? mapped.isSME
      ? generateSMEUrl(mapped.slug, sitecoreContext)
      : generateAuthorUrl(mapped.slug, sitecoreContext)
    : mapped.url;

  const author: AuthorCardFields = {
    name: mapped.name,
    givenName: { value: extractFieldValue(mapped.givenName) },
    surname: { value: extractFieldValue(mapped.surname) },
    biography: { value: extractFieldValue(mapped?.biography) },
    image: {
      value: {
        src: imgUrl,
        alt: imgAlt || mapped.name || '',
        srcset: mapped.photoUrlSrcSet || '',
      },
    },
    contentListingUrl: {
      value: {
        href: authOrUrl ?? '#',
        text: mapped.name || '',
      },
    },
    authorNameTag: 'h3',
    showContentListingLink: mapped.url ? true : false,
    areasOfExpertise: taxonomies,
    isSME: mapped.isSME || false,
    longBiographyTitle: { value: extractFieldValue(mapped?.longBiographyTitle) },
    longBiographySubtitle: { value: extractFieldValue(mapped?.longBiographySubtitle) },
    longBiographyContent: { value: extractFieldValue(mapped?.longBiographyContent) },
  };

  return author;
}

export function makeIndustry(
  industry: ContentTaxonomy,
  sitecoreContext: SitecoreContextValue
): TaxonomyItem {
  return {
    type: 'audience',
    name: { value: industry.name },
    link: { value: { href: generateIndustryUrl(industry.slug, sitecoreContext) } },
    isFeatured: false,
    slug: industry.slug,
    display: industry.name,
  };
}

export function makeTopic(
  topic: ContentTaxonomy,
  sitecoreContext: SitecoreContextValue
): TaxonomyItem {
  const { href, querystring } = generateTopicUrl(topic.slug, sitecoreContext, true);

  return {
    type: 'topic',
    name: { value: topic.name },
    link: { value: { href: href, querystring: querystring } },
    isFeatured: false,
    slug: topic.slug,
    display: topic.name,
  };
}

export function makeProduct(
  product: ContentTaxonomy,
  sitecoreContext: SitecoreContextValue
): TaxonomyItem {
  const { href, querystring } = generateProductUrl(product.slug, sitecoreContext, true);

  return {
    type: 'product',
    name: { value: product.name },
    link: { value: { href: href, querystring: querystring } },
    isFeatured: false,
    slug: product.slug,
    display: product.name,
  };
}

export function makeTaxonomyListToDiplay(
  industries: ContentTaxonomy[],
  topics: ContentTaxonomy[],
  sitecoreContext: SitecoreContextValue
) {
  // Slot A: Industry if present; otherwise first Topic
  let slotA: UptickTaxonomyItem | undefined;
  let slotB: UptickTaxonomyItem | undefined;

  if (industries.length > 0) {
    // A = first industry
    slotA = makeIndustry(industries[0], sitecoreContext);

    // B = first topic (if any)
    if (topics.length > 0) {
      slotB = makeTopic(topics[0], sitecoreContext);
    }
  } else {
    // No industry: A = first topic (if any)
    if (topics.length > 0) {
      slotA = makeTopic(topics[0], sitecoreContext);
    }
    // B = next topic (distinct) if available
    if (topics.length > 1) {
      slotB = makeTopic(topics[1], sitecoreContext);
    }
  }

  // Final list: up to two items, with the fallback behavior baked in
  const taxonomies = [slotA, slotB].filter(Boolean) as UptickTaxonomyItem[];
  return taxonomies.length > 0 ? taxonomies : [];
}

// output up to a maximum of four taxonomy items for authors
export function makeAuthorTaxonomyListToDiplay(
  areasOfExpertise: ContentTaxonomy[],
  sitecoreContext: SitecoreContextValue
): UptickTaxonomyItem[] {
  if (!areasOfExpertise) return [];

  const workingList = areasOfExpertise.slice(0, 4);
  const mappedItems = workingList.map((x) =>
    x.kind == 'topics'
      ? makeTopic(x, sitecoreContext)
      : x.kind == 'industry'
      ? makeIndustry(x, sitecoreContext)
      : makeProduct(x, sitecoreContext)
  );

  return mappedItems.filter(Boolean) as unknown as UptickTaxonomyItem[];
}
