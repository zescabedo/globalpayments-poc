import React from 'react';
import useSearchWithPagination from '@/utils/useSearchWithPagination';
import SearchResultCard from './SearchResultCard';
import SearchInput from './SearchInput';
import SearchPaginationBar from './SearchPaginationBar';
import { Container, Row } from 'react-bootstrap';
import { useI18n } from 'next-localization';
import { GeneralSearchFieldProps } from './GeneralSearch.types';
import { defaultTitleHeadingLevel, SearchApiConstants } from '@/constants/generalSearchConstants';

const GeneralSearch = (props: GeneralSearchFieldProps) => {
  const dataSource = props?.rendering?.dataSource || '';
  const pageSizeRaw = props?.params?.pageSize;
  const pageSize = pageSizeRaw ? parseInt(pageSizeRaw, 10) : SearchApiConstants?.defaultPageSize;

  const {
    searchTerm,
    setSearchTerm,
    results: resultList,
    handlePageChange,
    currentPage,
    totalPages,
    initialLoaded,
    loading,
  } = useSearchWithPagination(dataSource, pageSize);
  const searchPageUrl = props?.fields?.data?.item?.searchPageUrl?.jsonValue?.value?.href || '';
  const titleHeadingLevel =
    (props?.params?.titleHeadingLevel &&
      JSON.parse(props?.params?.titleHeadingLevel)?.Value?.value) ||
    defaultTitleHeadingLevel;

  const { t } = useI18n();

  const handleSearch = (searchText: string) => {
    setSearchTerm(searchText);
  };

  return (
    <div className="component">
      <div className="component-content">
        <Container className="search-bar-container">
          <Row>
            <div className="search-input-container">
              <SearchInput
                handleSearch={handleSearch}
                searchPageUrl={searchPageUrl}
                useShallowRouting={true}
              />
            </div>
          </Row>
        </Container>
        <Container className="search-results-container">
          <Row>
            <div className="search-results">
              {loading && !initialLoaded && (
                <div className="loading-in-progress">
                  <div className="search-result-overlay"></div>
                </div>
              )}

              {!loading && initialLoaded && (
                <ul className="search-results-list">
                  {resultList.length > 0 ? (
                    <>
                      {resultList.map((result, index) => (
                        <li key={index}>
                          <SearchResultCard
                            key={index}
                            searchResult={{ ...result, titleLevel: titleHeadingLevel }}
                            searchTerm={searchTerm}
                          />
                        </li>
                      ))}
                    </>
                  ) : (
                    <div className="container-no-data-found" aria-live="polite">
                      {t('No result found')}
                    </div>
                  )}

                  <SearchPaginationBar
                    resultList={resultList}
                    totalPages={totalPages}
                    currentPage={currentPage}
                    handlePageChange={handlePageChange}
                  />
                </ul>
              )}
            </div>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default GeneralSearch;
