import type {
  ContentListingResult,
  SearchConditionInput,
} from '@/components/layout/SearchTagResults/SearchTagResults.type';
import { SearchTagResultsConstant } from '@/constants/appConstants';
import { extractTags } from '@/utils/searchUtils';
import { chunk } from 'lodash';
import useSWR, { SWRConfiguration } from 'swr';

type ContentListingVariables = {
  pageSize?: number;
  language?: string | null;
  filters?: { OR: SearchConditionInput[] }[];
  audienceBlock?: SearchConditionInput[];
  after?: string | null;
};

type useSearchTagsProps = Omit<ContentListingVariables, 'filters'>;

const defaultOptions: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

type Fetcher<T> = () => Promise<T>;

// Helper function to generate request ID
const generateRequestId = (): string => {
  return `req_${Date.now()}`;
};

/**
 * Hook to fetch search tags
 */
export function useSearchTags({
  language,
  audienceBlock,
  pageSize,
  after = null,
}: useSearchTagsProps) {
  const key = ['searchTags', language, audienceBlock, after];

  const fetcher: Fetcher<ContentListingResult> = async () => {
    const requestId = generateRequestId();

    const response = await fetch('/api/uptick/search-tags', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
      },
      body: JSON.stringify({ language, audienceBlock, pageSize, requestId, after }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  const { data, error, ...rest } = useSWR<ContentListingResult>(key, fetcher, defaultOptions);

  return {
    ...rest,
    data: data ? extractTags(data.search?.results ?? []) : undefined,
    error,
  };
}

/**
 * Hook to fetch content listing
 */ export function useContentListing({
  pageSize,
  language,
  filters,
  audienceBlock,
  after = null,
}: ContentListingVariables) {
  const filtersKey = filters ? JSON.stringify(filters) : '';
  const staticKey = audienceBlock ? JSON.stringify(audienceBlock) : '';

  // Only create a valid key if pageSize is provided and greater than 0
  // Setting key to null prevents SWR from making any request
  const key =
    pageSize && pageSize > 0
      ? ['contentListing', pageSize, language, after, filtersKey, staticKey]
      : null;

  const fetcher: Fetcher<ContentListingResult> = async () => {
    const requestId = generateRequestId();
    const response = await fetch('/api/uptick/content-listing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
      },
      body: JSON.stringify({ pageSize, language, filters, audienceBlock, requestId, after }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  const { data, error, ...rest } = useSWR<ContentListingResult>(key, fetcher, defaultOptions);

  const results = data?.search?.results ?? [];
  const pages = chunk(results, SearchTagResultsConstant.DEFAULT_PAGESIZE);

  return {
    ...rest,
    data: data
      ? { ...data.search, pages, totalPages: pages.length, tags: extractTags(results) }
      : undefined,
    error,
  };
}
