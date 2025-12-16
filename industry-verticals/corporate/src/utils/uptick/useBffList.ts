'use client';

import useSWR from 'swr';

type Fetcher<T> = (url: string) => Promise<T>;
const defaultFetcher = (url: string) => fetch(url).then((r) => r.json());

export function useBffList<T>(url: string, fetcher: Fetcher<T> = defaultFetcher as Fetcher<T>) {
  // Use 'unknown' internally with SWR to avoid type conflicts, then cast to T
  const { data, error, isLoading } = useSWR<unknown>(url, fetcher);

  return {
    data: data as T | undefined,
    isError: !!error,
    isLoading: !!isLoading || !data,
  };
}
