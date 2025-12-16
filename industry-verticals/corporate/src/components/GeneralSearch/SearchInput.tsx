import React, { useEffect, useState } from 'react';
import { SearchInputProps } from './GeneralSearch.types';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { useI18n } from 'next-localization';
import { searchKeyQueryName } from '@/constants/generalSearchConstants';
import { useId } from 'react';
import { searchInputDataLayer } from '@/utils/analyticsTracking';

const SearchInput: React.FC<SearchInputProps> = ({
  handleSearch,
  isMobile = false,
  searchPageUrl,
  useShallowRouting,
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useI18n();
  const searchQuery = searchParams.has(searchKeyQueryName)
    ? searchParams.get(searchKeyQueryName)
    : '';
  const [searchText, setSearchText] = useState('');
  const uniqueId = useId();
  const inputId = `general-search-input-${uniqueId}`;
  const descId = `general-search-input-desc-${uniqueId}`;

  useEffect(() => {
    if (router.isReady) {
      setSearchText(searchQuery || '');
    }
  }, [router.isReady, searchQuery]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearchHandler();
    }
  };

  const handleSearchHandler = () => {
    if (handleSearch) {
      handleSearch(searchText); // Trigger search immediately
      searchInputDataLayer(searchText);
    }

    // Just update the URL, without waiting
    updateQueryParams(searchText);
  };

  const updateQueryParams = (searchquery: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(searchKeyQueryName, searchquery);

    router.push(
      `${searchPageUrl}?${params.toString()}`,
      undefined,
      useShallowRouting ? { shallow: true } : undefined
    );
  };

  return (
    <div className="input-container">
      <label htmlFor={inputId} className="sr-only">
        {t('Search')}
      </label>
      <input
        id={inputId}
        type="text"
        className={`search-input ${isMobile ? 'mobile' : ''}`}
        placeholder={t('Search here')}
        value={searchText}
        onChange={handleSearchInputChange}
        onKeyDown={handleKeyDown}
        aria-describedby={descId}
        role="searchbox"
        tabIndex={0}
      />

      <span id={descId} className="sr-only">
        {t('Search')}
      </span>
      <button
        className={`search-button ${isMobile ? 'mobile' : ''}`}
        onClick={handleSearchHandler}
        tabIndex={0}
        id="general-search-input-btn"
        aria-label={t('Search')}
      >
        {t('Search')}
      </button>
    </div>
  );
};

export default SearchInput;
