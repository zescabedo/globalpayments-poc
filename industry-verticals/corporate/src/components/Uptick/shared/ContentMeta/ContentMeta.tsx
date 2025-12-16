import Link from 'next/link';
import { ContentMetaProps } from './ContentMeta.types';
import { formatDateAuthor, isValidDate } from '@/utils/DateUtils';

export const ContentMeta = ({
  isDark = false,
  contentType,
  contentLink = '',
  authorName,
  variant = 'default',
  authorLink = '',
  contentDate,
  contentReadTime,
  className,
  useAnchor = false,
}: ContentMetaProps) => {
  const formattedDate = isValidDate(contentDate) ? formatDateAuthor(contentDate) : undefined;
  const isAuthorVariant = variant === 'author';

  return (
    <div
      className={`author-content-link-component ${className} ${
        isDark === true ? 'dark-author-content-link-component' : ''
      } ${isAuthorVariant ? 'author-content-link-component' : ''}`}
    >
      {isAuthorVariant && authorName && authorLink ? (
        <div className="content-author-name">
          <Link href={contentLink}>
            <span className="content-type">{contentType}</span>
          </Link>{' '}
          <span>by</span>{' '}
          <Link href={authorLink}>
            <span className="author-name">{authorName}</span>
          </Link>
        </div>
      ) : (
        <>
          {useAnchor ? (
            <a href={decodeURIComponent(contentLink || '')} className="content-link">
              <span>{contentType}</span>
            </a>
          ) : (
            <Link href={contentLink} className="content-link">
              <span>{contentType}</span>
            </Link>
          )}
        </>
      )}

      {formattedDate && <div className="author-date">{formattedDate}</div>}
      <div className="watch-time">{contentReadTime}</div>
    </div>
  );
};
