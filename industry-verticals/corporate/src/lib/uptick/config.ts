// Map your Sitecore site names -> their IDs used in filters (e.g., showIn multilist target IDs)
export const SITE_IDS: Record<string, string> = {
  CorporateHeadless: '{C8B1C1AD-D715-4E7C-834F-88D1BE893BDF}',
  //nbgpay: '{AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE}',
  //erste: '{FFFFFFFF-1111-2222-3333-444444444444}',
  // add more as needed
};

// Template IDs
export const TEMPLATE_IDS = {
  uptickContent: '{2DA8DDA8-49F4-40C1-83FE-C465CA56B588}', // _Uptick Content base
  uptickAuthor: '{PUT-AUTHOR-TEMPLATE-GUID-HERE}', // Uptick Author template
};

// Content Type IDs (if your contentType field stores GUIDs)
export const CONTENT_TYPE_IDS: Record<string, string> = {
  article: '{29F6DA70-4AD0-46E5-ABBF-F9EA55D0B047}',
  // case-study: '{...}',
  // ebook: '{...}',
  // etc.
};

// Uptick root path or ID for safety (optional)
export const UPTICK_ROOT_ID = '{38CDA13E-B419-4B7E-BC47-AC3923F4EEFC}';
export const UPTICK_ROOT_PATH = '/sitecore/content/Global/Lists/Uptick';

// Default page size for queries
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 100;

// Default sort order
export const DEFAULT_SORT = 'contentPublishedDate desc';
// Other constants as needed
