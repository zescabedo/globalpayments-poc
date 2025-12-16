import { LinkField, ComponentParams, ComponentRendering } from '@sitecore-jss/sitecore-jss-nextjs';

export interface SearchResult {
  title: string;
  pageDescription: string;
  pageUrl: string;
  titleLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface SearchResultsHook {
  loading: boolean;
  setSearchTerm: (searchTerm: string) => void;
  data: unknown;
  results: SearchResult[];
  handlePageChange: (page: number) => void;
  currentPage: number;
  totalPages: number;
  searchTerm: string;
  setIsReady: (boolean: boolean) => void;
  setPageSize: (size: number) => void;
  pagesize: number;
  orderDirection: string;
  error: unknown;
  nextPage: () => void;
  prevPage: () => void;
  initialLoaded: boolean;
}

export interface SearchResultCardProps {
  searchTerm: string;
  searchResult: SearchResult;
}

export interface SearchInputProps {
  handleSearch?: (searchText: string) => void;
  isMobile?: boolean;
  searchPageUrl?: string;
  useShallowRouting?: boolean;
}

export interface SearchPaginationBarProps {
  resultList: SearchResult[];
  totalPages: number;
  currentPage: number;
  handlePageChange: (page: number) => void;
}

export interface GeneralSearchFieldProps {
  fields: {
    scopeQuery: { value: string; limit: number };
    data: {
      item: {
        searchPageUrl: {
          jsonValue: LinkField;
        };
      };
    };
  };
  params: ComponentParams;
  rendering: ComponentRendering & { params: ComponentParams };
}
