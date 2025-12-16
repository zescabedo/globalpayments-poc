import localDebug from '@/lib/_platform/logging/debug-log';
export async function fetchAllUptickContent(params: {
  site: string;
  lang: string;
  typesCsv?: string; // e.g., "{GUID1},{GUID2}"
  pageSize?: number;
}) {
  const items: unknown[] = [];
  let after: string | null = null;
  const pageSize = params.pageSize ?? 100;

  try {
    while (true) {
      const qs = new URLSearchParams({
        site: params.site,
        lang: params.lang,
        pageSize: String(pageSize),
      });
      if (params.typesCsv) qs.append('types', params.typesCsv);
      if (after) qs.append('after', after);

      // Use the /search endpoint if you need extra filters; /content is fine for simple lists
      const url = `/api/uptick/search?${qs.toString()}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Fetch failed ${res.status}`);

      const json = await res.json();
      items.push(...json.items);

      const { hasNext, endCursor } = json.pageInfo || { hasNext: false, endCursor: null };
      if (!hasNext || !endCursor) break;
      after = endCursor;
    }
  } catch (err) {
    localDebug.uptick('Error fetching all content:', err);
    throw err; // Let caller handle
  }

  return items;
}

// Usage:
/*const allTextContent = await fetchAllContent({
  site: 'corporate',
  lang: 'en',
  typesCsv: '{UPTICK_TEXT_GUID}',
  pageSize: 100, // batch size
});*/
