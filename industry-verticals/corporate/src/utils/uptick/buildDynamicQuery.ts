import localDebug from '@/lib/_platform/logging/debug-log';

export function buildDynamicQueryForSearchService(
  baseQuery: string,
  params: {
    types?: string | string[];
    industries?: string | string[];
    topics?: string | string[];
    products?: string | string[];
    showInId?: string;
    siteName?: string;
    searchtext?: string;
    isSME?: string;
    authorId?: string;
    match?: 'any' | 'all';
  }
): string {
  const query = baseQuery;

  const dynamicFilters: string[] = [];
  localDebug.uptickBff(
    `[Uptick API] /content site:${params.siteName} types:${params.types} industries:${params.industries} topics:${params.topics} types:${params.types} products:${params.products} showIn:${params.showInId} searchtext:"${params.searchtext} isSME:${params.isSME}"`
  );

  // 1 contentType OR block
  if (params.types) {
    const contentTypeIds = splitCsv(params.types);
    const ors = contentTypeIds
      .map((id) => `{ name: "contentType", value: "${id}", operator: CONTAINS }`)
      .join(', ');
    dynamicFilters.push(`{ OR: [ ${ors} ] }`);
  }

  // 2 topic OR block
  if (params.topics) {
    const topicsIds = splitCsv(params.topics);
    const ors = topicsIds
      .map((id) => `{ name: "topics", value: "${id}", operator: CONTAINS }`)
      .join(', ');
    dynamicFilters.push(`{ OR: [ ${ors} ] }`);
  }

  // 3 industries OR block
  if (params.industries) {
    const industriesIds = splitCsv(params.industries);
    const ors = industriesIds
      .map((id) => `{ name: "industries", value: "${id}", operator: CONTAINS }`)
      .join(', ');
    dynamicFilters.push(`{ OR: [ ${ors} ] }`);
  }

  // 4 products OR block
  if (params.products) {
    const productsIds = splitCsv(params.products);
    const ors = productsIds
      .map((id) => `{ name: "products", value: "${id}", operator: CONTAINS }`)
      .join(', ');
    dynamicFilters.push(`{ OR: [ ${ors} ] }`);
  }

  // 4 showIn OR block
  if (params.showInId) {
    dynamicFilters.push(`{ name: "showIn", value: "${params.showInId}", operator: CONTAINS }`);
  }

  // 5 searchtext
  if (params.searchtext)
    dynamicFilters.push(
      `{ name: "headlesscontent", value: "${params.searchtext.replace(
        /"/g,
        '\\"'
      )}", operator: CONTAINS }`
    );

  // 6 SME for Authors
  if (params.isSME) {
    dynamicFilters.push(`{ name: "isSME", value: "${params.isSME}", operator: EQ }`);
  }

  // 6 Author filter
  if (params.authorId) {
    dynamicFilters.push(`{ name: "uptickAuthor", value: "${params.authorId}", operator: CONTAINS }`);
  }

  localDebug.uptickBff(
    `[Uptick API] dynamic filters replaced :${
      dynamicFilters.length ? dynamicFilters.join('\n          ') : ''
    } "`
  );
  // Insert dynamic filters into the base query
  return query.replace(
    '#__DYNAMIC_FILTERS__',
    dynamicFilters.length ? dynamicFilters.join('\n          ') : ''
  );
}

export function buildDynamicQueryFetchForService(
  baseQuery: string,
  params: {
    isSME?: string;
  }
): string {
  const query = baseQuery;

  const dynamicfetchQuery: string[] = [];
  localDebug.uptickBff(`[Uptick API] /content site:${baseQuery} isSME:${params.isSME} "`);

  // 1 SME Fetch for Authors
  if (params.isSME == 'true') {
    dynamicfetchQuery.push(`longBiographyTitle {
            jsonValue
          }
          longBiographySubtitle{
          jsonValue
        }
        longBiographyContent{
          jsonValue
        }`);
  }

  localDebug.uptickBff(
    `[Uptick API] dynamic Fetch requested :${
      dynamicfetchQuery.length ? dynamicfetchQuery.join('\n          ') : ''
    } "`
  );
  // Insert dynamic filters into the base query
  return query.replace(
    '#__DYNAMIC_FETCH__',
    dynamicfetchQuery.length ? dynamicfetchQuery.join('\n          ') : ''
  );
}

function splitCsv(v?: string | string[]) {
  return (Array.isArray(v) ? v.join(',') : v || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
