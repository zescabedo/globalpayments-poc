import React, { Dispatch, SetStateAction, useMemo } from 'react';

interface PaginationProps extends Omit<React.ComponentPropsWithoutRef<'nav'>, 'results'> {
  totalPages?: number;
  pageNumber: number;
  setPageNumber: Dispatch<SetStateAction<number>>;
}

const Pagination = ({ pageNumber, totalPages = 1, setPageNumber, ...props }: PaginationProps) => {
  const handleChangePage = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setPageNumber(page);
    }
  };

  const visiblePages = useMemo<(number | string)[]>(() => {
    if (totalPages <= 6) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    if (pageNumber <= 3) {
      return [0, 1, 2, 3, '...', totalPages - 1];
    }

    if (pageNumber >= totalPages - 4) {
      return [0, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1];
    }

    return [0, '...', pageNumber - 1, pageNumber, pageNumber + 1, '...', totalPages - 1];
  }, [pageNumber, totalPages]);

  const isSinglePage = totalPages <= 1;

  return (
    <nav aria-label="Pagination" {...props} className="pagination">
      <ul className="pagination-list">
        <li>
          <button
            onClick={() => handleChangePage(0)}
            disabled={isSinglePage || pageNumber === 0}
            className="pagination-text mobile-hidden"
          >
            First
          </button>
        </li>

        <li>
          <button
            className="pagination-text"
            onClick={() => handleChangePage(pageNumber - 1)}
            disabled={isSinglePage || pageNumber === 0}
          >
            Previous
          </button>
        </li>

        {visiblePages.map((p, idx) =>
          p === '...' ? (
            <li key={idx} className="px-2">
              <span aria-hidden="true">…</span>
            </li>
          ) : (
            <li key={idx}>
              <button
                className={`pagination-btn ${pageNumber === p ? 'selected' : ''}`}
                onClick={() => handleChangePage(p as number)}
                aria-current={p === pageNumber ? 'page' : undefined}
              >
                {(p as number) + 1}
              </button>
            </li>
          )
        )}

        <li>
          <button
            className="pagination-text"
            disabled={isSinglePage || pageNumber === totalPages - 1}
            onClick={() => handleChangePage(pageNumber + 1)}
          >
            Next
          </button>
        </li>

        <li>
          <button
            className="pagination-text mobile-hidden"
            onClick={() => handleChangePage(totalPages - 1)}
            disabled={isSinglePage || pageNumber === totalPages - 1}
          >
            Last
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
