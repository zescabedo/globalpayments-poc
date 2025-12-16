import loaderIcon from '@/assets/icons/loader.svg';
import { ContentMeta } from '@/components/Uptick/shared/ContentMeta/ContentMeta';
import { TaxonomyTags } from '@/components/Uptick/TaxonomyTags/TaxonomyTags';
import { useShouldRender } from '@/utils/useShouldRender';
import { RichText, useSitecoreContext } from '@sitecore-jss/sitecore-jss-nextjs';
import Image from 'next/image';
import Link from 'next/link';
import React, { useMemo } from 'react';
import type { Result } from './SearchTagResults.type';
import ImageItem from '@/components/ui/Image/ImageItem';
import {
  generateAllContentUrl,
  generateContentUrl,
  generateIndustryUrl,
} from '@/utils/uptick/linkResolver';
import { stripHtml } from '@/utils/stripHtml';
import { useI18n } from 'next-localization';
import { getLastUrlPart, getSlug } from '@/utils/urlUtils';
import { useRouter } from 'next/router';

interface ResultProps extends Omit<React.ComponentPropsWithoutRef<'ul'>, 'results'> {
  results?: Result[];
  isPending?: boolean;
  noDataFound?: boolean;
  noResultText?: JsonValue;
  isIndustry?: boolean;
}

const Results: React.FC<ResultProps> = ({
  results,
  isPending,
  noResultText,
  noDataFound,
  isIndustry,
  ...props
}) => {
  if (isPending)
    return (
      <div className="loader">
        <Image src={loaderIcon} alt="loading icon" width={50} height={50} />
      </div>
    );

  if (noDataFound) {
    return (
      <div className="no-results">
        <RichText field={noResultText?.jsonValue} />
      </div>
    );
  }

  return (
    <ul {...props} className="content-card-list">
      {results?.map((item, idx) => (
        <ContentCard
          className="content-card"
          isIndustry={isIndustry}
          key={`${item.url.path}-${idx}`}
          result={item}
        />
      ))}
    </ul>
  );
};

type ContentCardProps<T extends keyof JSX.IntrinsicElements = 'li'> = {
  as?: T;
  result: Result;
  className?: string;
  isIndustry?: boolean;
} & JSX.IntrinsicElements[T];

const ContentCard = <T extends keyof JSX.IntrinsicElements = 'li'>({
  as,
  result,
  className,
  isIndustry,
  ...rest
}: ContentCardProps<T>) => {
  const Component = (as ?? 'li') as keyof JSX.IntrinsicElements;
  const { t } = useI18n();
  const shouldRender = useShouldRender();
  const router = useRouter();
  const { sitecoreContext } = useSitecoreContext();

  const contentType = result?.contentType?.jsonValue;
  const contentCardSlug = result?.slug?.jsonValue?.value || '';

  const contentCardUrl = generateContentUrl(contentCardSlug, sitecoreContext);
  const contentTypeUrl = useMemo(() => {
    return isIndustry
      ? generateIndustryUrl(getLastUrlPart(router.asPath), sitecoreContext, [getSlug(contentType)])
      : generateAllContentUrl(sitecoreContext, [getSlug(contentType)]);
  }, [isIndustry, router.asPath, sitecoreContext, contentType]);

  const rawContentReadTime = result?.readTime?.jsonValue?.value;
  const contentReadTime =
    rawContentReadTime && !isNaN(Number(rawContentReadTime)) ? Number(rawContentReadTime) : null;

  const contentTypeName = contentType?.name?.toLocaleLowerCase();
  const contentReadTimeText = contentReadTime
    ? `${contentReadTime} ${contentTypeName === 'video' ? t('minwatch') : t('minread')}`
    : '';

  const cardImage = useMemo(() => {
    const contentCardImage = result?.contentCardImage?.jsonValue;
    const contentMainImage = result?.contentMainImage?.jsonValue;

    if (contentCardImage?.value?.src) return contentCardImage;
    if (contentMainImage?.value?.src) return contentMainImage;
    return undefined;
  }, [result?.contentCardImage?.jsonValue, result?.contentMainImage?.jsonValue]);

  const imageAlt = cardImage?.alt || result?.contentTitle?.jsonValue?.value || 'Image';

  return (
    <Component className={className} {...rest}>
      <Link
        href={contentCardUrl || '#'}
        className="content-card-image"
        aria-label={`Go to ${contentCardSlug}`}
      >
        <ImageItem
          usePlaceholderFallback
          nextImageSrc={cardImage?.value?.src}
          field={{ value: { ...(cardImage?.value || {}), alt: imageAlt } }}
        />
      </Link>

      <div className="content-card-text">
        {shouldRender(result?.topics?.jsonValue) && (
          <TaxonomyTags useAnchor isIndustry={isIndustry} item={result} />
        )}

        {shouldRender(result?.contentTitle?.jsonValue) && (
          <Link
            href={contentCardUrl || '#'}
            className="content-card-title"
            aria-label={`Go to ${contentCardSlug}`}
          >
            <span>{stripHtml(result?.contentTitle?.jsonValue.value)}</span>
          </Link>
        )}

        <ContentMeta
          useAnchor
          className="author-by-line"
          contentType={contentType?.name || ''}
          contentDate={result?.contentPublishedDate?.jsonValue?.value || ''}
          contentReadTime={contentReadTimeText}
          contentLink={(contentTypeUrl as string) || ''}
        />
      </div>
    </Component>
  );
};
export default Results;
