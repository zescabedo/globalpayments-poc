import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchResult, SearchResultsHook } from '@/components/GeneralSearch/GeneralSearch.types';
import { useSitecoreContext } from '@sitecore-content-sdk/nextjs';
import { useRouter } from 'next/router';
import { searchKeyQueryName } from '@/constants/generalSearchConstants';

const ScrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const useSearchWithPagination = (scopeQuery: string, limit: number): SearchResultsHook => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.has(searchKeyQueryName)
    ? searchParams.get(searchKeyQueryName)
    : '';
  const router = useRouter();

  const [isReady, setIsReady] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagesize, setPageSize] = useState(limit);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoaded, setIntialLoaded] = useState<boolean>(false);
  const [error, setError] = useState<unknown>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const { sitecoreContext } = useSitecoreContext();
  const language = sitecoreContext?.language;
  const siteName = sitecoreContext?.site?.name;
  const itemId = sitecoreContext?.itemId;

  const fetchData = useCallback(async () => {
    if (!isReady) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/search/getsearchresults', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchString: searchTerm,
          pageNo: currentPage,
          pageSize: pagesize,
          language: language,
          siteName: siteName,
          itemId: itemId,
          scopeQuery: scopeQuery,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      setResults(data?.Results || []);
      setTotalPages(Math.ceil((data.TotalCount ?? 0) / pagesize));
      if (!initialLoaded) {
        setIntialLoaded(true);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage, pagesize, isReady]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = useCallback((newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1);
  }, []);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      ScrollToTop();
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      ScrollToTop();
    }
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      ScrollToTop();
    }
  };

  useEffect(() => {
    if (router.isReady) {
      setSearchTerm(searchQuery || '');
      setIsReady(true);
    }
  }, [router.isReady, searchQuery, setIsReady, setSearchTerm]);

  return {
    searchTerm,
    setSearchTerm: handleSearch,
    pagesize,
    results,
    setPageSize,
    orderDirection: 'ASC',
    loading,
    error,
    data: results,
    nextPage,
    prevPage,
    handlePageChange,
    currentPage,
    totalPages,
    setIsReady,
    initialLoaded,
  };
};

export default useSearchWithPagination;
