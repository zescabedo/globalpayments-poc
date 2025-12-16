import Results from '@/components/layout/SearchTagResults/Results';
import { useUptickSearch, useUptickSearchTotal } from '@/hooks/useSecondaryNav';
import { useSitecoreContext } from '@sitecore-jss/sitecore-jss-nextjs';
import { useI18n } from 'next-localization';
import { useSearchParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import { Container } from 'react-bootstrap';
import { EditorialSearchResultProps } from './EditorialSearchResult.types';
import Pagination from '@/components/layout/SearchTagResults/Pagination';

const EditorialSearchResult = (props: EditorialSearchResultProps) => {
  const { t } = useI18n();
  const { sitecoreContext } = useSitecoreContext();
  const searchParams = useSearchParams();
  const [pageNumber, setPageNumber] = useState(0);

  // Extract search parameters
  const term = searchParams.get('term')?.trim() || '';
  const language = sitecoreContext?.language || 'en-US';

  // Fetch data
  const { total: totalData, isLoading: isLoadingTotal } = useUptickSearchTotal({
    term,
    language,
  });

  const { data, isLoading: isLoadingSearch } = useUptickSearch({
    term,
    language,
    pageSize: totalData || undefined,
  });

  // Extract title
  const title = props?.fields?.data?.item?.title?.jsonValue?.value;

  // Compute loading and data states
  const isLoading = isLoadingTotal || isLoadingSearch;
  const hasResults = (data?.total ?? 0) > 0;
  const currentPageResults = data?.pages?.[pageNumber];
  const totalPages = data?.totalPages ?? 0;

  const noResultText = useMemo(() => ({ jsonValue: { value: t('nomatchesfound') } }), [t]);

  // Early return: No search term
  if (!term) {
    return (
      <div className="component search-tag-result" aria-label="Search Tag Result">
        <Container>
          <div className="search-tag-result-empty">
            <p>{t('nomatchesfound')}</p>
          </div>
        </Container>
      </div>
    );
  }

  // Determine the current state
  const showPagination = !isLoading && hasResults && totalPages > 1;
  const resultsToShow = isLoading || !hasResults ? undefined : currentPageResults;

  return (
    <div className="component search-tag-result" aria-label="Search Tag Result">
      <Container>
        {title && <h3 className="search-tag-result-heading">{`${title} "${term}"`}</h3>}

        <Results
          isPending={isLoading}
          noDataFound={!isLoading && !hasResults}
          results={resultsToShow}
          noResultText={noResultText}
        />

        {showPagination && (
          <Pagination
            pageNumber={pageNumber}
            totalPages={totalPages}
            setPageNumber={setPageNumber}
          />
        )}
      </Container>
    </div>
  );
};

export default EditorialSearchResult;
