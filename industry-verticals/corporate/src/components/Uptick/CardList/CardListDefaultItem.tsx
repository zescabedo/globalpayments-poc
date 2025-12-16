import { RichText, useSitecoreContext } from '@sitecore-jss/sitecore-jss-nextjs';
import { CardFields } from '@/components/Uptick/CardList/Card.types';
import { UptickTaxonomy } from '@/components/Uptick/UptickTaxonomy';
import { Card, CardContent } from '../ui/UptickCard';
import Link from 'next/link';
import { useShouldRender } from '@/utils/useShouldRender';
import { ContentMeta } from '@/components/Uptick/shared/ContentMeta/ContentMeta';
import { generateAllContentUrl, generateIndustryUrl } from '@/utils/uptick/linkResolver';
import { formatReadTime } from '@/utils/uptick/readTime';
import { getLastUrlPart, getSlug } from '@/utils/urlUtils';
import ImageItem from '@/components/ui/Image/ImageItem';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { SearchTagResultsConstant } from '@/constants/appConstants';

const CardListDefaultItem = (props: CardFields): JSX.Element => {
  const router = useRouter();
  const authorNameTag = props.authorNameTag || 'h3';
  const Heading = authorNameTag as keyof JSX.IntrinsicElements;
  const shouldRender = useShouldRender();
  const { sitecoreContext } = useSitecoreContext();

  const isIndustry = useMemo(() => {
    return sitecoreContext?.route?.templateId === SearchTagResultsConstant.AUDIENCE_TEMPLATE_ID;
  }, [sitecoreContext?.route?.templateId]);

  const contentType = props?.contentType?.jsonValue;
  const contentTypeSlug = getSlug({ displayName: contentType.value });
  const contentTypeUrl = useMemo(() => {
    return isIndustry
      ? generateIndustryUrl(getLastUrlPart(router.asPath), sitecoreContext, [contentTypeSlug])
      : generateAllContentUrl(sitecoreContext, [contentTypeSlug]);
  }, [isIndustry, router.asPath, sitecoreContext, contentType]);

  const readTimeValue = props.readTime?.jsonValue?.value || '';
  const contentTypeValue = props.contentType?.jsonValue?.value || '';
  const readTime = formatReadTime(readTimeValue, contentTypeValue);

  return (
    <Card className="uptick-card ec-clickable-card">
      <CardContent>
        <div className="card-image">
          {shouldRender(props.image) && (
            <Link href={props.contentListingUrl?.value?.href || ''}>
              <ImageItem
                usePlaceholderFallback
                field={props.image}
                nextImageSrc={props?.image?.value?.src}
              />
            </Link>
          )}
        </div>
        <div className="card-details">
          <div className="card-tags">
            <UptickTaxonomy taxonomyItems={props.taxonomies} />
          </div>

          {shouldRender(props.title?.value) && (
            <Link href={props.contentListingUrl?.value?.href || ''}>
              {props.title?.value && <Heading className="card-name">{props.title?.value}</Heading>}
            </Link>
          )}

          {props.description?.value && (
            <RichText tag="div" className="card-description" field={props.description} />
          )}

          <ContentMeta
            className="author-by-line"
            contentType={props.contentType?.jsonValue?.value || ''}
            contentDate={props.publishedDate?.jsonValue?.value || ''}
            contentReadTime={readTime}
            contentLink={contentTypeUrl as string}
            useAnchor={true}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CardListDefaultItem;
