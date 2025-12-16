import { Result } from '@/components/layout/SearchTagResults/SearchTagResults.type';
import { generateRequestId } from '@/lib/uptick/errors';
import { chunk } from 'lodash';
import useSWR, { SWRConfiguration } from 'swr';

export interface UptickSuggestionsResponse {
  search: {
    results: Result[];
  };
}

export interface UptickSearchResponse {
  search: {
    pageInfo?: {
      endCursor: string;
      hasNext: boolean;
    };
    total?: number;
    results: Result[];
  };
}

type UptickSuggestionsVariables = {
  term: string;
  language: string;
};

type UptickSearchVariables = {
  language: string;
  term: string | null;
  pageSize?: number;
};

const defaultOptions: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

export type SuggestionTagResponse = {
  item: {
    slug: JsonValue;
  };
};

const API_ENDPOINT = '/api/uptick/editorial-search';

// API fetcher function
async function apiFetcher<T>(url: string, body: any): Promise<{ data: T; requestId: string }> {
  const requestId = generateRequestId();

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-request-id': requestId,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}

// Hook for uptick suggestions (first 5 results)
export function useUptickSuggestions({ language, term }: UptickSuggestionsVariables) {
  const key = term.length ? ['uptickSuggestions', term, language] : null;

  const fetcher = () =>
    apiFetcher<UptickSuggestionsResponse>(API_ENDPOINT, {
      type: 'suggestions',
      term,
      language,
    });

  const { data: response, ...rest } = useSWR(key, fetcher, defaultOptions);

  return {
    ...rest,
    data: response?.data?.search?.results ?? undefined,
    requestId: response?.requestId,
  };
}

// Hook for uptick search total
export function useUptickSearchTotal({ language, term, pageSize = 2 }: UptickSearchVariables) {
  const key = term?.trim() && term.length ? ['uptickSearchTotal', language, term] : null;

  const fetcher = () =>
    apiFetcher<UptickSearchResponse>(API_ENDPOINT, {
      type: 'searchTotal',
      language,
      term,
      pageSize,
    });

  const { data: response, ...rest } = useSWR(key, fetcher, defaultOptions);

  return {
    ...rest,
    total: response?.data?.search?.total ?? null,
    requestId: response?.requestId,
  };
}

// Hook for uptick search with pagination
export function useUptickSearch({ language, term, pageSize }: UptickSearchVariables) {
  const key =
    term?.trim() && term?.length && pageSize ? ['uptickSearch', language, term, pageSize] : null;

  const fetcher = () =>
    apiFetcher<UptickSearchResponse>(API_ENDPOINT, {
      type: 'search',
      language,
      term,
      pageSize,
    });

  const { data: response, ...rest } = useSWR(key, fetcher, defaultOptions);

  const results = response?.data?.search?.results ?? [];
  const pages = chunk(results, 15);

  return {
    ...rest,
    data: response ? { ...response.data.search, pages, totalPages: pages.length } : undefined,
    requestId: response?.requestId,
  };
}
