import React from 'react';

export interface LoadMoreButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
  text?: string;
  loadingText?: string;
  className?: string;
}

/**
 * Reusable Load More button component for Uptick
 * Designed to work with pagination hooks like useLoadMore
 */
const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({
  onClick,
  isLoading = false,
  hasMore = true,
  text = 'Load More',
  loadingText = 'Loading...',
  className = '',
}) => {
  if (!hasMore) return null;

  return (
    <div className="load-more-container">
      <button
        className={`btn btn-cta-secondary ${className}`}
        onClick={onClick}
        disabled={isLoading}
        aria-label={isLoading ? loadingText : text}
      >
        {isLoading ? loadingText : text}
      </button>
    </div>
  );
};

export default LoadMoreButton;
