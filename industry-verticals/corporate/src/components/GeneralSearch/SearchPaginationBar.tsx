import React from 'react';
import { SearchPaginationBarProps } from './GeneralSearch.types';
import { PaginationConstants } from '@/constants/generalSearchConstants';
import { useI18n } from 'next-localization';

const SearchPaginationBar: React.FC<SearchPaginationBarProps> = ({
  resultList = [],
  totalPages = 1,
  currentPage = 1,
  handlePageChange,
}) => {
  const { t } = useI18n();

  const firstPage = PaginationConstants.firstPage;
  const lastPage = totalPages;

  const getVisiblePages = (current: number, total: number): number[] => {
    const pages: number[] = [];
    const first = 1;
    const last = total;
    const windowSize = PaginationConstants.visiblePageWindow;
    const halfWindow = Math.floor(windowSize / 2);

    if (total <= windowSize + 2) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
      return pages;
    }

    if (current <= halfWindow + 1) {
      for (let i = 1; i <= windowSize; i++) {
        pages.push(i);
      }
      pages.push(last);
      return pages;
    }

    if (current >= total - halfWindow) {
      pages.push(first);
      for (let i = total - windowSize + 1; i <= total; i++) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(first);

    const start = current - halfWindow;
    const end = current + halfWindow;

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    pages.push(last);

    return pages;
  };

  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <>
      {resultList.length > 0 && totalPages > 1 && (
        <nav className="pagination-container" aria-label="Search results pagination">
          <ul className="pagination">
            {/* Previous Button */}
            <li className={`${currentPage === firstPage ? 'disabled' : ''} prev-list`}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                aria-label={t('Go to prev page')}
                className="previous"
              >
                PREVIOUS
              </button>
            </li>

            {/* Page Numbers with Ellipsis */}
            {visiblePages.map((page, index) => {
              const prevPage = visiblePages[index - 1];

              // Show ellipsis if there's a gap
              const showEllipsis = prevPage && page - prevPage > 1;

              return (
                <React.Fragment key={page}>
                  {showEllipsis && <li aria-hidden="true">...</li>}
                  <li>
                    <button
                      className={`${currentPage === page ? 'activePage' : ''} page-number`}
                      onClick={() => handlePageChange(page)}
                      aria-label={`${t('Go to page')} ${page}`}
                      aria-current={currentPage === page ? 'page' : undefined}
                      disabled={currentPage === page}
                    >
                      {page}
                    </button>
                  </li>
                </React.Fragment>
              );
            })}

            {/* Next Button */}
            <li className={`${currentPage === lastPage ? 'disabled' : ''} next-list`}>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                aria-label={t('Go to next page')}
                className="next"
              >
                NEXT
              </button>
            </li>
          </ul>
        </nav>
      )}
    </>
  );
};

export default SearchPaginationBar;
