import { GeolocationConstants, SearchTagResultsConstant } from '@/constants/appConstants';
import { useContentListing, useSearchTags } from '@/hooks/useContentListing';
import {
  queryFromSelected,
  selectedFromQuery,
  transformSelectedFilters,
} from '@/utils/searchUtils';
import { UptickUrlConfig } from '@/utils/uptick/linkResolver';
import {
  cleanInternalQueryParams,
  getCleanPathname,
  toQueryString,
  validateFilters,
} from '@/utils/urlUtils';
import { useSitecoreContext } from '@sitecore-jss/sitecore-jss-nextjs';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Container } from 'react-bootstrap';
import Filters from './Filters';
import Pagination from './Pagination';
import Results from './Results';
import type {
  SearchConditionInput,
  SearchTagResultsProps,
  SelectedFilters,
} from './SearchTagResults.type';
import localDebug from '@/lib/_platform/logging/debug-log';

const EMPTY_SELECTED: SelectedFilters = {
  contentTypes: new Map(),
  products: new Map(),
  topics: new Map(),
};

const INITIAL_PAGE_SIZE = 15;

const SearchTagResults: React.FC<SearchTagResultsProps> = ({ rendering }) => {
  const router = useRouter();
  const { sitecoreContext } = useSitecoreContext();

  const fields = rendering?.fields?.data;
  const searchFilterBar = fields?.searchResultTag || fields?.searchFilterBar;
  const totalItems = fields?.content?.total;

  const language = sitecoreContext?.language || SearchTagResultsConstant.DEFAULT_LANGUAGE;

  const [pageNumber, setPageNumber] = useState(0);
  const [selected, setSelected] = useState<SelectedFilters>(EMPTY_SELECTED);
  const [hasInvalidFilters, setHasInvalidFilters] = useState(false);
  const isInitializedFromUrl = useRef(false);
  const isUpdatingUrl = useRef(false);

  const uptickConfig = sitecoreContext.uptickConfiguration as UptickUrlConfig;

  const isIndustry = useMemo(() => {
    return sitecoreContext?.route?.templateId === SearchTagResultsConstant.AUDIENCE_TEMPLATE_ID;
  }, [sitecoreContext?.route?.templateId]);

  const audienceBlock: SearchConditionInput[] | undefined = useMemo(() => {
    if (isIndustry) {
      return [{ name: 'industries', value: sitecoreContext?.route?.itemId ?? '', operator: 'EQ' }];
    }
    return undefined;
  }, [isIndustry, sitecoreContext?.route?.itemId]);

  // Check for URL filters EARLY - before any data fetching
  const hasUrlFilters = useMemo(() => {
    if (!router.isReady) return false;

    const contentTypeParam = uptickConfig?.contentTypeQuerystringField || 'types';
    const productParam = uptickConfig?.productQuerystringField || 'products';
    const topicParam = uptickConfig?.topicQuerystringField || 'topics';

    const { query } = router;
    return (
      query[contentTypeParam] !== undefined ||
      query[productParam] !== undefined ||
      query[topicParam] !== undefined
    );
  }, [router.isReady, router.query, uptickConfig]);

  // Fetch tags separately when URL filters are present
  // This allows us to validate filters before fetching content
  const { data: tagsData, isLoading: isTagsLoading } = useSearchTags({
    language,
    audienceBlock,
    pageSize: hasUrlFilters ? 1000 : undefined, // Only fetch if URL filters exist
  });

  const filters = useMemo(() => transformSelectedFilters(selected), [selected]);

  // Check if any filters are active in state
  const hasActiveFilters = useMemo(() => {
    return selected.contentTypes.size > 0 || selected.products.size > 0 || selected.topics.size > 0;
  }, [selected]);

  // Combined check
  const hasAnyFilters = hasActiveFilters || hasUrlFilters;

  // Initial load with 15 items (only when no filters are present)
  const {
    data: initialData,
    isLoading: isInitialLoading,
    mutate: mutateInitial,
  } = useContentListing({
    pageSize: !hasAnyFilters ? SearchTagResultsConstant.DEFAULT_PAGESIZE : undefined,
    language,
    filters,
    audienceBlock,
  });

  // Full data load: fetch all items when filters are active OR in background after initial load
  const {
    data: fullData,
    error: fullDataError,
    isValidating: isFullDataValidating,
    isLoading: isFullDataLoading,
    mutate: mutateFull,
  } = useContentListing({
    pageSize:
      hasAnyFilters && isInitializedFromUrl.current
        ? totalItems
          ? Math.min(totalItems, 1000)
          : 1000
        : initialData && totalItems && totalItems > INITIAL_PAGE_SIZE
        ? Math.min(totalItems, 1000)
        : undefined,
    language,
    filters,
    audienceBlock,
  });

  // Log error if full data fetch fails (but don't break the UI)
  useEffect(() => {
    if (fullDataError) {
      console.warn('Failed to load full data, using initial results:', fullDataError);
    }
  }, [fullDataError]);

  // Optimistically update cache when filters change
  useEffect(() => {
    if (hasActiveFilters) {
      // Clear initial data cache when filters are applied
      mutateInitial(undefined, false);
    }
  }, [hasActiveFilters, mutateInitial]);

  const isLoading = useMemo(() => {
    // If URL filters exist but we're still loading tags, show loading
    if (hasUrlFilters && (isTagsLoading || !isInitializedFromUrl.current)) {
      return true;
    }

    if (hasAnyFilters) {
      // Show loading until full data arrives for any filters
      return !fullData || isFullDataValidating;
    }
    // Without filters, show loading for initial page
    return isInitialLoading;
  }, [
    hasUrlFilters,
    isTagsLoading,
    hasAnyFilters,
    fullData,
    isFullDataValidating,
    isInitialLoading,
    isInitializedFromUrl.current,
  ]);

  const data = useMemo(() => {
    if (hasAnyFilters) {
      return fullData;
    }
    // Otherwise, show initial page or fullData if already loaded
    return fullData || initialData;
  }, [hasAnyFilters, fullData, initialData]);

  // Calculate total pages: use estimated count until full data loads
  const totalPages = useMemo(() => {
    if (fullData?.totalPages) {
      // Full data loaded, use actual pages
      return fullData.totalPages;
    }

    if (initialData?.total && initialData?.total > 0) {
      // Estimate based on total items
      return Math.ceil(initialData?.total / SearchTagResultsConstant.DEFAULT_PAGESIZE);
    }

    if (totalItems && totalItems > 0) {
      // Estimate based on total items
      return Math.ceil(totalItems / SearchTagResultsConstant.DEFAULT_PAGESIZE);
    }

    // Fallback to initial data pages
    return initialData?.totalPages || 0;
  }, [fullData?.totalPages, initialData?.total, initialData?.totalPages, totalItems]);

  // Memoize valid slug sets to avoid recreating them on every validation
  const validSlugSets = useMemo(() => {
    const tags = tagsData || data?.tags;
    if (!tags) return null;

    return {
      contentTypes: new Set(tags.contentTypes?.map((t) => t.slug) || []),
      products: new Set(tags.products?.map((t) => t.slug) || []),
      topics: new Set(tags.topics?.map((t) => t.slug) || []),
    };
  }, [tagsData, data?.tags]);

  // Initialize selected state from URL when tags data becomes available
  useEffect(() => {
    if (!router.isReady || isInitializedFromUrl.current) return;

    // Wait for tags if URL filters are present
    if (hasUrlFilters && !tagsData) return;

    const contentTypeParam = uptickConfig?.contentTypeQuerystringField || 'types';
    const productParam = uptickConfig?.productQuerystringField || 'products';
    const topicParam = uptickConfig?.topicQuerystringField || 'topics';

    const hasQueryParams =
      router.query[contentTypeParam] || router.query[productParam] || router.query[topicParam];

    if (hasQueryParams && tagsData) {
      const isValid = validateFilters(router.query, validSlugSets, {
        contentTypeParam,
        productParam,
        topicParam,
      });

      if (!isValid) {
        setHasInvalidFilters(true);
        isInitializedFromUrl.current = true;
        return;
      }

      const fromQuery = selectedFromQuery(router.query, tagsData, {
        contentTypeParam,
        productParam,
        topicParam,
      });

      if (
        fromQuery.contentTypes.size > 0 ||
        fromQuery.products.size > 0 ||
        fromQuery.topics.size > 0
      ) {
        setSelected(fromQuery);
        setPageNumber(0);
        setHasInvalidFilters(false);
      }
    }

    isInitializedFromUrl.current = true;
  }, [router.isReady, router.query, tagsData, hasUrlFilters, uptickConfig, validSlugSets]);

  // Sync URL when selected state changes (but not during initialization)
  useEffect(() => {
    if (!router.isReady || !isInitializedFromUrl.current || isUpdatingUrl.current) return;

    const contentTypeParam = uptickConfig?.contentTypeQuerystringField || 'types';
    const productParam = uptickConfig?.productQuerystringField || 'products';
    const topicParam = uptickConfig?.topicQuerystringField || 'topics';

    const built = queryFromSelected(selected, {
      contentTypeParam,
      productParam,
      topicParam,
    });

    // Clean existing internal params
    const nextQuery: ParsedUrlQuery = cleanInternalQueryParams(router.query);

    // Add our custom filter params
    [contentTypeParam, productParam, topicParam].forEach((key) => {
      const value = built[key as keyof typeof built];
      if (value?.length) {
        nextQuery[key] = value;
      } else {
        delete nextQuery[key];
      }
    });

    const currentQueryString = new URLSearchParams(router.query as any).toString();
    const nextQueryString = new URLSearchParams(nextQuery as any).toString();

    if (currentQueryString !== nextQueryString) {
      const siteName = sitecoreContext?.site?.name;
      const cleanPathname = getCleanPathname(router.asPath, siteName);

      const queryString = toQueryString(nextQuery);

      localDebug.uptick.debug('Final cleanPathname', cleanPathname);
      localDebug.uptick.debug('Final query', nextQuery);

      isUpdatingUrl.current = true;

      const targetUrl = queryString ? `${cleanPathname}?${queryString}` : cleanPathname;

      router
        .replace({ pathname: router.pathname, query: nextQuery }, targetUrl, { shallow: true })
        .finally(() => {
          isUpdatingUrl.current = false;
        });
    }
  }, [selected, router.isReady, uptickConfig]);

  const handleFiltersChange = useCallback(
    (next: SelectedFilters) => {
      setSelected(next);
      setPageNumber(0);
      setHasInvalidFilters(false);

      // Clear both caches when filters change for fresh data
      mutateInitial(undefined, false);
      mutateFull(undefined, false);
    },
    [mutateInitial, mutateFull]
  );

  const noDataFound = !isLoading && (data?.total === 0 || hasInvalidFilters);

  const filterTags = useMemo(() => {
    if (hasActiveFilters && data?.tags) {
      // When filters are active, use filtered results' tags for disable logic
      return data.tags;
    }
    // For URL filter validation or initial load, use tagsData or data.tags
    return tagsData || data?.tags || null;
  }, [hasActiveFilters, tagsData, data?.tags]);

  return (
    <div className="component search-tag-result" aria-label="Search Tag Result">
      <Filters
        content={fields?.content}
        language={language}
        selected={selected}
        onChange={handleFiltersChange}
        filterTags={filterTags}
        audienceBlock={audienceBlock}
        hasInvalidFilters={hasInvalidFilters}
        {...searchFilterBar}
      />

      <Container>
        <Results
          isIndustry={isIndustry}
          isPending={isLoading || (pageNumber > 0 && isFullDataLoading)}
          noDataFound={noDataFound}
          results={data?.pages?.[pageNumber]}
          noResultText={searchFilterBar?.noResultText}
        />

        {!isLoading && !noDataFound && totalPages > 1 ? (
          <Pagination
            pageNumber={pageNumber}
            totalPages={totalPages}
            setPageNumber={setPageNumber}
          />
        ) : null}
      </Container>
    </div>
  );
};

export default SearchTagResults;
