import { ContentMeta } from '@/components/Uptick/shared/ContentMeta/ContentMeta';
import { TaxonomyTags } from '@/components/Uptick/TaxonomyTags/TaxonomyTags';
import { generateAllContentUrl, generateContentUrl } from '@/utils/uptick/linkResolver';
import { useShouldRender } from '@/utils/useShouldRender';
import { Text, useSitecoreContext } from '@sitecore-jss/sitecore-jss-nextjs';
import Link from 'next/link';
import { useMemo } from 'react';
import { Container } from 'react-bootstrap';
import { FeaturedArticlesProps, TargetItem } from './FeaturedArticles.types';
import { useI18n } from 'next-localization';
import { getSlug } from '@/utils/urlUtils';
import ImageItem from '@/components/ui/Image/ImageItem';

const FeaturedArticles = (props: FeaturedArticlesProps) => {
  const fields = props?.rendering?.fields;
  const articlesList = fields?.data?.item?.featuredArticles?.targetItems;
  const { sitecoreContext } = useSitecoreContext();
  const isEditing = sitecoreContext.pageEditing;

  if (!fields?.data?.item && !isEditing) {
    return null;
  }

  const [featured, others] = useMemo(() => {
    if (!articlesList || articlesList.length === 0) return [null, []];
    const [first, ...rest] = articlesList;
    return [first, rest];
  }, [articlesList]);

  return (
    <div className="featured-articles" aria-label="Featured Articles">
      <Container>
        <div className="featured-articles-wrapper">
          <ContentCard data={featured} variant="featured" />
          <div className="content-card-list">
            {others?.map((article) => (
              <ContentCard key={article.id} data={article} />
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
};

type ContentCardProps = {
  data: TargetItem | null;
  variant?: 'featured' | 'default';
};

export const ContentCard = ({ variant = 'default', data }: ContentCardProps) => {
  const { t } = useI18n();
  const shouldRender = useShouldRender();
  const { sitecoreContext } = useSitecoreContext();

  const contentType = data?.contentType?.jsonValue;
  const contentTypeSlug = contentType ? getSlug(contentType) : '';
  const contentCardUrl = generateContentUrl(data?.slug?.jsonValue?.value || '', sitecoreContext);
  const contentTypeUrl = generateAllContentUrl(sitecoreContext, [contentTypeSlug]);

  const rawContentReadTime = data?.contentReadTime?.jsonValue?.value;
  const contentReadTime =
    rawContentReadTime && !isNaN(Number(rawContentReadTime)) ? Number(rawContentReadTime) : null;

  const contentTypeName = contentType?.name?.toLocaleLowerCase();

  const contentReadTimeText = contentReadTime
    ? `${contentReadTime} ${contentTypeName === 'video' ? t('minwatch') : t('minread')}`
    : '';

  return (
    <article className={`content-card ${variant === 'featured' ? 'featured' : ''}`}>
      {shouldRender(data?.contentMainImage?.jsonValue) && (
        <Link href={contentCardUrl} className="card-image-container" locale={false}>
          <ImageItem
            usePlaceholderFallback
            nextImageSrc={data?.contentMainImage?.jsonValue?.value?.src}
            field={data?.contentMainImage?.jsonValue}
          />
        </Link>
      )}

      <div className="card-content">
        <TaxonomyTags item={data} />

        {shouldRender(data?.title?.jsonValue) && (
          <Link href={contentCardUrl} className="card-title" locale={false}>
            <Text tag="span" field={data?.title?.jsonValue} />
          </Link>
        )}

        <ContentMeta
          className="author-by-line"
          contentType={contentType?.name || ''}
          contentDate={data?.contentPublishedDate?.jsonValue?.value || ''}
          contentReadTime={contentReadTimeText}
          contentLink={contentTypeUrl as string}
        />
      </div>
    </article>
  );
};

export default FeaturedArticles;
