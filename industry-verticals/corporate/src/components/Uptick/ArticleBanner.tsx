import { Container, Row } from 'react-bootstrap';
import React, { useEffect, useMemo, useState } from 'react';
import {
  useSitecoreContext,
  RichText,
  Text,
  Link,
  SitecoreContextValue,
  Field,
  ImageField,
  LinkField,
} from '@sitecore-jss/sitecore-jss-nextjs';

import { SocialSharing } from './SocialSharing';
import { ArticleBannerProps, ArticleBannerFields } from './ArticleBanner.types';
import { UptickTaxonomy } from './UptickTaxonomy';

import { trimToLength } from '@/utils/tools';
import { getLastUrlPart, isDownloadableUrl } from '@/utils/urlUtils';
import { ContentTaxonomy, makeTaxonomyListToDiplay } from '@/lib/uptick/mappers';
import { generateAllContentUrl, generateAuthorUrl } from '@/utils/uptick/linkResolver';

import { buildUptickUrl } from '@/utils/uptick/buildUptickUrl';
import { useBffList } from '@/utils/uptick/useBffList';
import { ProductionApiResponse } from '@/utils/uptick/useUptickCardList';
import { ContentMeta } from './shared/ContentMeta/ContentMeta';
import localDebug from '@/lib/_platform/logging/debug-log';
import { isValidDate } from '@/utils/DateUtils';
import { formatReadTime } from '@/utils/uptick/readTime';
import ImageItem from '../ui/Image/ImageItem';
import { useI18n } from 'next-localization';

type ArticleLite = {
  slug: string;
  title?: string;
  summary?: string;
  mainImageUrl?: string;
  mainImageSrcSet?: string;
  contentType?: string;
  contentTypeName?: string;
  contentTypeLink?: string;
  authors?: [{ name?: string; slug?: string }];
  publishedDate?: string; // ISO
  readTime?: string;
  topics?: ContentTaxonomy[];
  industries?: ContentTaxonomy[];
  primaryCta?: { href?: string; text?: string };
};

/** ==== Helpers ==== */
function pickSlug(scCtx: SitecoreContextValue): string {
  // Try common places first (customize as needed)
  const routeContext = (scCtx?.route as any) || {};
  const fromField =
    routeContext?.fields?.Slug || routeContext?.fields?.Slug?.value || routeContext?.displayName;

  localDebug.uptick(
    `[ArticleBanner] slug-------------------------- ${fromField} -----------cts - ${routeContext?.displayName} -----Slug back --- ${routeContext?.fields?.Slug?.value}`
  );

  if (typeof fromField === 'string' && fromField.trim()) {
    return fromField;
  }

  // Fall back to route name
  const routeName = (routeContext as any)?.name;
  if (typeof routeName === 'string' && routeName.trim()) {
    return getLastUrlPart(routeName);
  }

  // Last resort: client path
  if (typeof window !== 'undefined') {
    return getLastUrlPart(window.location.pathname);
  }

  return '';
}

function toArticleBannerFields(
  a: ArticleLite,
  sitecoreContext: SitecoreContextValue
): ArticleBannerFields {
  const image: ImageField = {
    value: a.mainImageUrl
      ? { src: a.mainImageUrl, alt: a.title || '', srcset: a.mainImageSrcSet }
      : { src: '', alt: '' },
  };

  const author = a.authors && a.authors.length > 0 ? a.authors[0] : {};

  const authorName: Field<string> = { value: author?.name || '' };

  const authorLink: LinkField = {
    value: { href: generateAuthorUrl(author.slug || author.name || 'Author', sitecoreContext) },
  };

  const contentTypeLink = generateAllContentUrl(sitecoreContext, [a.contentTypeName]);

  const cta: LinkField = {
    value: a.primaryCta?.href
      ? { href: a.primaryCta.href, text: a.primaryCta.text || '' }
      : { href: '', text: '' },
  };

  const publishDate: Field<Date> = {
    value: a.publishedDate && isValidDate(a.publishedDate) ? new Date(a.publishedDate) : undefined,
  };

  const taxonomy = makeTaxonomyListToDiplay(
    (a.industries || []).filter(Boolean),
    (a.topics || []).filter(Boolean),
    sitecoreContext
  );

  return {
    title: { value: a.title?.jsonValue ? a.title?.jsonValue?.value : a.title || '' },
    description: { value: a.summary ? trimToLength(a.summary, 159) : '' },
    cta,
    contentType: { value: a.contentTypeName || '' },
    authorName,
    authorLink,
    contentTypeLink: contentTypeLink,
    publishDate,
    readTime: { value: a.readTime || '' },
    image,
    social: true,
    taxonomy,
  };
}

/** ==== Component ==== */
const ArticleBanner = (props: ArticleBannerProps): JSX.Element => {
  const { sitecoreContext } = useSitecoreContext();
  const site = sitecoreContext?.site?.name || 'CorporateHeadless';
  const lang = sitecoreContext?.language || 'en-us';
  const { t } = useI18n();

  // Primary: Build fields from Sitecore context route fields
  const contextFields = useMemo<ArticleBannerFields | null>(() => {
    const uc = (sitecoreContext?.route?.fields as any) || {};

    // Check if essential fields exist to determine if we have valid context data
    const hasContentTitle = uc?.ContentTitle?.value || uc?.ContentTitle;
    const hasSlug = uc?.Slug?.value || uc?.Slug;
    const hasContentMainImage = uc?.ContentMainImage?.value?.src;

    // If essential fields are missing, return null to trigger BFF call
    if (!hasContentTitle || !hasSlug || !hasContentMainImage) {
      localDebug.uptick('[ArticleBanner] Missing essential context fields, will use BFF', {
        hasContentTitle,
        hasSlug,
        hasContentMainImage,
      });
      return null;
    }

    localDebug.uptick('[ArticleBanner] Using Sitecore context route fields (primary)');

    // Extract arrays with proper field names from Sitecore layout service
    const topics = Array.isArray(uc?.Topics) ? uc.Topics : [];
    const industries = Array.isArray(uc?.Industries) ? uc.Industries : [];
    const author = Array.isArray(uc?.Author) ? uc.Author[0] : undefined;
    const contentTypeArray = Array.isArray(uc?.ContentType) ? uc.ContentType : [];
    const contentType = contentTypeArray.length > 0 ? contentTypeArray[0] : null;

    // Map to ContentTaxonomy with both id and name
    const topicTaxonomy: ContentTaxonomy[] = topics.map((t: any) => ({
      id: t?.id,
      name: t?.name,
      slug: t?.Slug,
    }));

    const industryTaxonomy: ContentTaxonomy[] = industries.map((i: any) => ({
      id: i?.id,
      name: i?.name,
      slug: i?.Slug,
    }));

    const taxonomy = makeTaxonomyListToDiplay(industryTaxonomy, topicTaxonomy, sitecoreContext);

    const image: ImageField = uc?.ContentMainImage?.value
      ? uc.ContentMainImage
      : {
          value: {
            src: '',
            alt: '',
          },
        };

    // Use Slug field from author if available
    const authorSlug = author?.Slug || getLastUrlPart((author?.name || '').replace(/\s+/g, '-'));
    const authorLink = generateAuthorUrl(authorSlug, sitecoreContext);
    const readTimeValue = uc?.['Read Time']?.value || uc?.['Read Time'] || '';
    const readTimeText = formatReadTime(readTimeValue);

    const givenName = author?.['Given name'] || '';
    const surname = author?.['Surname'] || '';
    const fullAuthorName =
      givenName && surname ? `${givenName} ${surname}`.trim() : author?.name || ' ';

    return {
      title: { value: uc?.ContentTitle?.value || uc?.ContentTitle || ' ' },
      description: {
        value: uc?.ContentSummary?.value
          ? trimToLength(uc.ContentSummary.value, 159)
          : uc?.ContentSummary && typeof uc?.ContentSummary === 'string'
          ? trimToLength(uc.ContentSummary, 159)
          : ' ',
      },
      cta: uc?.PrimaryCTA?.value?.href ? uc.PrimaryCTA : { value: { href: '', text: '' } },
      contentType: { value: contentType?.Title || contentType?.name || 'Article' },
      contentTypeLink: generateAllContentUrl(sitecoreContext, [
        contentType?.Slug || contentType?.Title?.toLowerCase() || contentType?.name?.toLowerCase(),
      ]),
      authorName: { value: fullAuthorName },
      authorLink: author?.name
        ? {
            value: {
              href: authorLink,
              text: fullAuthorName,
            },
          }
        : { value: { href: '', text: '' } },
      publishDate: {
        value: uc?.ContentPublishedDate ? new Date(uc.ContentPublishedDate) : undefined,
      },
      readTime: { value: readTimeText },
      image,
      social: true,
      taxonomy,
    };
  }, [sitecoreContext?.route?.fields]);

  // Only proceed with BFF call if context fields are missing
  const shouldUseBff = contextFields === null;

  // Figure out slug for BFF call
  const initialSlug = useMemo(() => pickSlug(sitecoreContext), [sitecoreContext]);
  const [slug, setSlug] = useState(initialSlug);

  // Client re-check if needed (in case SSR lacked pathname)
  useEffect(() => {
    if (!slug && typeof window !== 'undefined') {
      setSlug(getLastUrlPart(window.location.pathname));
    }
  }, [slug]);

  // Build BFF URL only if we need it
  const pageSize = 1;
  const bffUrl =
    shouldUseBff && slug
      ? buildUptickUrl('contentslug', { site, lang, pageSize }, { slug } /* idOrSlug param */)
      : '';

  localDebug.uptick(
    `[ArticleBanner] BFF call ${shouldUseBff ? 'ENABLED' : 'DISABLED'}, Slug: ${slug}`
  );

  const { data } = useBffList<ProductionApiResponse<ArticleLite>>(
    bffUrl || '',
    props.fetcherOverride as
      | ((url: string) => Promise<ProductionApiResponse<ArticleLite>>)
      | undefined
  );

  // Map BFF response
  let bffFields: ArticleBannerFields | null = null;

  if (shouldUseBff && data && data.success) {
    const src = Array.isArray(data.data?.content) ? data.data.content[0] : data.data?.content;
    if (src) {
      bffFields = toArticleBannerFields(src as ArticleLite, sitecoreContext);
      localDebug.uptick('[ArticleBanner] Using BFF data');
    }
  }

  // Priority: contextFields (Sitecore) > bffFields > props.fields
  const fields: ArticleBannerFields = contextFields ??
    bffFields ??
    props.fields ?? {
      title: { value: '' },
      description: { value: '' },
      cta: { value: { href: '', text: '' } },
      contentType: { value: '' },
      authorName: { value: '' },
      authorLink: { value: { href: '', text: '' } },
      publishDate: { value: undefined },
      readTime: { value: '' },
      image: { value: { src: '', alt: '' } },
      social: true,
      taxonomy: [],
    };

  // Social sharing current URL
  const [pageUrl, setPageUrl] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') setPageUrl(window.location.href);
  }, []);

  return (
    <div className="component uptick-article-banner">
      <Container>
        <Row>
          <div className="content">
            <UptickTaxonomy taxonomyItems={fields.taxonomy} />

            {/* Title */}
            {fields.title?.value && (
              <Text tag="h1" className="article-title" field={fields.title} />
            )}

            {/* Description */}
            {fields.description?.value && (
              <RichText
                tag="div"
                className="article-short-description"
                field={fields.description}
              />
            )}

            {/* CTA */}
            {fields.cta?.value?.href && (
              <div className="article-cta-container">
                {isDownloadableUrl(fields.cta.value.href) ? (
                  <a
                    href={fields.cta.value.href}
                    className="btn btn-cta-primary btn-sm"
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {fields.cta.value.text || t('Download')}
                  </a>
                ) : (
                  <Link field={fields.cta} className="btn btn-cta-primary btn-sm" />
                )}
              </div>
            )}

            {/* Meta */}
            {(fields.contentType?.value ||
              fields.authorName?.value ||
              fields.authorLink?.value ||
              fields.readTime?.value ||
              isValidDate(fields.publishDate?.value)) && (
              <ContentMeta
                contentType={fields.contentType?.value || ''}
                contentLink={(fields.contentTypeLink as string) || ''}
                authorName={fields.authorName?.value || ''}
                authorLink={fields.authorLink?.value?.href || ''}
                contentDate={fields.publishDate?.value || ''}
                contentReadTime={fields.readTime?.value || ''}
                variant="author"
                className="author-by-line"
              />
            )}

            {/* Social */}
            {fields.social && (fields.social as any).value !== false && (
              <SocialSharing articleUrl={pageUrl} contentType={fields.contentType?.value} />
            )}
          </div>
          <div className="media">
            <ImageItem
              usePlaceholderFallback
              field={fields.image}
              nextImageSrc={fields?.image?.value?.src}
            />
          </div>
        </Row>
      </Container>
    </div>
  );
};

export default ArticleBanner;
