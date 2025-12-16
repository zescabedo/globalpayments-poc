'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';

export interface LoadMoreResponse<T> {
  success: boolean;
  data: {
    content: T[];
    total: number;
    hasNext: boolean;
    after?: string;
  };
  meta: {
    requestId: string;
    timestamp: string;
    processingTime: number;
  };
}

interface UseLoadMoreOptions<T> {
  initialUrl: string;
  pageSize?: number;
  fetcher?: (url: string) => Promise<LoadMoreResponse<T>>;
}

interface UseLoadMoreReturn<T> {
  items: T[];
  isLoading: boolean;
  isError: boolean;
  hasMore: boolean;
  loadMore: () => void;
  isLoadingMore: boolean;
  total: number;
}

const defaultFetcher = <T,>(url: string): Promise<LoadMoreResponse<T>> =>
  fetch(url).then((r) => r.json());

/**
 * Generic hook for Load More pagination functionality
 * Works with any Uptick API endpoint that returns paginated data
 */
export function useLoadMore<T>({
  initialUrl,
  pageSize = 12,
  fetcher = defaultFetcher,
}: UseLoadMoreOptions<T>): UseLoadMoreReturn<T> {
  const [allItems, setAllItems] = useState<T[]>([]);
  const [currentUrl, setCurrentUrl] = useState<string>(initialUrl);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);

  // Fetch initial data
  const { data, error, isLoading } = useSWR<LoadMoreResponse<T>>(currentUrl, fetcher, {
    revalidateOnFocus: false,
    onSuccess: (response) => {
      if (response?.success && response.data) {
        // For initial load, replace items
        if (currentUrl === initialUrl) {
          setAllItems(response.data.content);
          // Only show "Load More" if we have items AND there are more to load
          setHasMore(response.data.content.length > 0 && response.data.hasNext);
        } else {
          // For load more, append items
          setAllItems((prev) => [...prev, ...response.data.content]);
          setHasMore(response.data.hasNext);
        }
        setTotal(response.data.total);
        setIsLoadingMore(false);
      }
    },
  });

  const loadMore = useCallback(() => {
    if (!data?.data?.after || !hasMore || isLoadingMore) return;

    setIsLoadingMore(true);

    // Build next URL with 'after' cursor
    const url = new URL(currentUrl, window.location.origin);
    url.searchParams.set('after', data.data.after);
    setCurrentUrl(url.pathname + url.search);
  }, [data, hasMore, isLoadingMore, currentUrl]);

  return {
    items: allItems,
    isLoading: isLoading && !isLoadingMore,
    isError: !!error,
    hasMore,
    loadMore,
    isLoadingMore,
    total,
  };
}
