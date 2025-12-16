type Common = {
  site: string;
  lang: string;
  pageSize?: number;
  after?: string | null;
};

type ContentFilters = {
  types?: string[]; // content type GUIDs
  topics?: string[]; // topic slugs/IDs (as indexed)
  categories?: string[]; // industries/categories
  industries?: string[]; // audience slugs/IDs
  q?: string; // full-text
  authorId?: string; // author GUID
  isSME?: string; // author SME flag
};

type RelatedOpts = {
  slug: string; // base item slug
  match?: 'any' | 'all'; // tag match strategy
  types?: string[]; // optional restrict related by types
  limit?: number; // number of related to return
};

export function buildUptickUrl(
  endpoint: 'content' | 'search' | 'authors' | 'author' | 'related' | 'contentslug',
  common: Common,
  filters: ContentFilters = {},
  related?: RelatedOpts
) {
  const base =
    endpoint === 'authors'
      ? '/api/uptick/authors'
      : endpoint === 'author'
      ? `/api/uptick/authors/${encodeURIComponent(String((filters as unknown)?.authorId || ''))}`
      : endpoint === 'related'
      ? `/api/uptick/content/${encodeURIComponent(String(related?.slug || ''))}/related`
      : endpoint === 'contentslug'
      ? `/api/uptick/content/${encodeURIComponent(String((filters as unknown)?.slug || ''))}`
      : endpoint === 'search'
      ? '/api/uptick/search'
      : '/api/uptick/content';

  const qs = new URLSearchParams();
  qs.set('site', common.site);
  qs.set('lang', common.lang);
  if (common.pageSize) qs.set('pageSize', String(common.pageSize));
  if (common.after) qs.set('after', common.after);

  const appendCsv = (key: string, arr?: string[]) => {
    if (arr && arr.length) qs.set(key, arr.join(','));
  };

  if (endpoint === 'related') {
    if (related?.match) qs.set('match', related.match);
    if (related?.limit) qs.set('limit', String(related.limit));
    appendCsv('types', related?.types);
  } else {
    appendCsv('types', filters.types);
    appendCsv('topics', filters.topics);
    appendCsv('categories', filters.categories);
    appendCsv('industries', filters.industries);
    if (filters.q) qs.set('q', filters.q);
    if (filters.authorId) qs.set('authorId', String(filters.authorId));
    if (filters.isSME) qs.set('isSME', String(filters.isSME));
  }

  return `${base}?${qs.toString()}`;
}
