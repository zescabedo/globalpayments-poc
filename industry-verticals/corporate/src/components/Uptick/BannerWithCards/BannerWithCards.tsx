import Heading from '@/components/ui/Heading/Heading';
import {
  generateAllContentUrl,
  generateAuthorUrl,
  generateContentUrl,
} from '@/utils/uptick/linkResolver';
import { useUptickCardList } from '@/utils/uptick/useUptickCardList';
import {
  LayoutServicePageState,
  RichText,
  useSitecoreContext,
} from '@sitecore-jss/sitecore-jss-nextjs';
import Link from 'next/link';
import { useMemo } from 'react';
import { CardFields } from '../CardList/Card.types';
import { ContentMeta } from '../shared/ContentMeta/ContentMeta';
import { TaxonomyTags } from '../TaxonomyTags/TaxonomyTags';
import { BannerWithCardsProps, FeaturedCardProps } from './BannerWithCards.types';
import LinkItem from '@/components/ui/Link/Link';
import { getSlug } from '@/utils/urlUtils';
import { formatReadTime } from '@/utils/uptick/readTime';
import ImageItem from '@/components/ui/Image/ImageItem';
import { useI18n } from 'next-localization';

const BannerWithCards = ({ rendering, params, ...props }: BannerWithCardsProps): JSX.Element => {
  const { sitecoreContext } = useSitecoreContext();
  const fieldsItem = props?.fields?.data?.item;
  const contentTypeIds = [fieldsItem?.contentTypeSelection?.jsonValue?.id || ''];
  const pageState = sitecoreContext?.pageState;
  const site = sitecoreContext?.site?.name || 'corporate';
  const lang = sitecoreContext?.language || 'en';
  const isEditing = sitecoreContext && sitecoreContext?.pageState === LayoutServicePageState.Edit;

  const { listProps, isLoading } = useUptickCardList({
    pageState,
    params,
    site,
    lang,
    rendering,
    types: contentTypeIds,
    title: 'test-title',
    pageSize: 5,
  });

  const featuredArticle = listProps?.fields?.cards[0];
  const featuredContentTagsData = useMemo(() => {
    const industry = featuredArticle?.industries?.[0];
    const topic = featuredArticle?.topics?.[0];
    return {
      industries: {
        jsonValue: {
          displayName: industry?.name || '',
          fields: { Slug: { value: industry?.slug || '' } },
        },
      },
      topics: {
        jsonValue: {
          displayName: topic?.name || '',
          fields: { Slug: { value: topic?.slug || '' } },
        },
      },
    };
  }, [featuredArticle]);

  const enableFeaturedCard = !!fieldsItem?.enableFeaturedCard?.jsonValue?.value;
  const enableListCards = !!fieldsItem?.enableListCards?.jsonValue?.value;
  const isBlockWithCards = enableFeaturedCard && enableListCards;
  const isBlockWithoutCards = enableFeaturedCard && !enableListCards;

  if (!isEditing && !isBlockWithCards && !isBlockWithoutCards) {
    return <></>;
  }

  if (isLoading) {
    return <p>Loading...</p>;
  }

  const contentTypeName = fieldsItem?.contentTypeSelection?.jsonValue?.name || '';
  const contentTypeLink = generateAllContentUrl(sitecoreContext, [
    getSlug({ displayName: featuredArticle?.contentType?.jsonValue?.value }),
  ]);

  return (
    <div className={`banner-with-cards-component ${isBlockWithCards ? 'dark-background' : ''}`}>
      <div className="cards-container container">
        <FeaturedCard
          featuredArticle={featuredArticle}
          featuredContentTagsData={featuredContentTagsData}
          isBlockWithCards={isBlockWithCards}
          isBlockWithoutCards={isBlockWithoutCards}
          contentTypeName={contentTypeName}
          contentTypeLink={contentTypeLink as string}
          featuredCardCta={fieldsItem?.featuredCardCta}
        />
      </div>

      {isBlockWithCards && (
        <MultiCardsSection
          listCardsTitle={fieldsItem?.listCardsTitle}
          cards={listProps?.fields?.cards?.slice(1, 5) || []}
          contentTypeName={contentTypeName}
          contentTypeLink={contentTypeLink as string}
        />
      )}
    </div>
  );
};

const FeaturedCard = ({
  featuredArticle,
  featuredContentTagsData,
  isBlockWithCards,
  isBlockWithoutCards,
  contentTypeName,
  contentTypeLink,
  featuredCardCta,
}: FeaturedCardProps & {
  isBlockWithCards: boolean;
  isBlockWithoutCards: boolean;
}) => {
  const { sitecoreContext } = useSitecoreContext();
  const authorLink = generateAuthorUrl(featuredArticle?.authors?.[0]?.slug || '', sitecoreContext);
  const contentCardUrl = generateContentUrl(featuredArticle?.slug || '', sitecoreContext);

  const readTimeText = formatReadTime(featuredArticle?.readTime?.jsonValue?.value);

  return (
    <>
      {/* Desktop View */}
      <div className="banner-with-cards-featured-container">
        <div className="banner-with-cards-wrapper">
          {featuredArticle?.image?.value?.src && (
            <ImageItem
              usePlaceholderFallback
              field={featuredArticle?.image}
              nextImageSrc={featuredArticle?.image?.value?.src}
              className="banner-with-cards-image"
            />
          )}
        </div>

        <div className="overlay"></div>

        <div
          className={`card-content-container ${
            isBlockWithoutCards ? 'without-card-content-container' : ''
          }`}
        >
          <div>
            <div className="tags-container dark-theme-tags-container">
              <TaxonomyTags isDark item={featuredContentTagsData} />
            </div>
            <div className="feature-card-content-wrapper row">
              <Link href={contentCardUrl} className="feature-card-link">
                <h2 className="feature-card-title dark-feature-card-title">
                  {featuredArticle?.title.value}
                </h2>
              </Link>

              <div className="feature-card-cta-author-wrapper">
                <FeatureCardButton featuredCardCta={featuredCardCta} />
                <ContentMeta
                  contentType={contentTypeName}
                  contentLink={contentTypeLink}
                  authorLink={authorLink as string}
                  authorName={featuredArticle?.authors?.[0]?.name || ''}
                  contentDate={featuredArticle?.publishedDate?.jsonValue?.value || ''}
                  contentReadTime={readTimeText}
                  isDark={true}
                  variant="author"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card-content-mobile-container">
          <div className="full-width-cta-button">
            <FeatureCardButton featuredCardCta={featuredCardCta} />
          </div>
          <div className="play-button">
            {featuredArticle?.primaryCTA?.href && (
              <Link href={featuredArticle?.primaryCTA?.href}>
                <span className="play-icon" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="banner-with-cards-featured-mobile-container">
        <div>
          <div className={`tags-container ${isBlockWithCards ? 'dark-theme-tags-container' : ''}`}>
            <TaxonomyTags isDark item={featuredContentTagsData} />
          </div>
          <Link href={contentCardUrl}>
            <h2
              className={`feature-card-title ${isBlockWithCards ? 'dark-feature-card-title' : ''}`}
            >
              {featuredArticle?.title.value}
            </h2>
          </Link>
          <RichText
            tag="p"
            className={`feature-card-description ${
              isBlockWithCards ? 'dark-feature-card-description' : ''
            }`}
            field={{ value: featuredArticle?.summary }}
          />

          <ContentMeta
            contentType={contentTypeName}
            contentLink={contentTypeLink}
            authorName={featuredArticle?.authors?.[0]?.name || ''}
            authorLink={featuredArticle?.authors?.[0]?.url || ''}
            contentDate={featuredArticle?.publishedDate?.jsonValue?.value || ''}
            contentReadTime={readTimeText}
            isDark={true}
            variant="author"
          />
        </div>
      </div>
    </>
  );
};

const MultiCardsSection = ({
  cards,
  contentTypeName,
  contentTypeLink,
  listCardsTitle,
}: {
  cards: CardFields[];
  contentTypeName: string;
  contentTypeLink: string;
  listCardsTitle: JsonValue;
}) => {
  const { t } = useI18n();

  let exploreContent = `explore ${contentTypeName}`;
  exploreContent = t(exploreContent);

  return (
    <div className="multicards-title-container container">
      <div className="multicards-header-container">
        <Heading
          richText
          tag="h3"
          field={listCardsTitle.jsonValue}
          className="multicard-header-title dark-theme"
        />
        <div className="explore-content-cta">
          <Link href={contentTypeLink}>
            <span className="explore-content-title dark-theme">{exploreContent}</span>
          </Link>
          <span className="explore-arrow-icon" />
        </div>
      </div>
      <div className="multicards-container">
        {cards.map((content, index) => (
          <ContentCard key={index} content={content} isBlockWithCards={true} />
        ))}
      </div>
    </div>
  );
};

const ContentCard = ({
  content,
  isBlockWithCards,
}: {
  content: CardFields;
  isBlockWithCards: boolean;
}) => {
  const { sitecoreContext } = useSitecoreContext();
  const contentTypeUrl = generateAllContentUrl(sitecoreContext, [
    getSlug({ displayName: content?.contentType?.jsonValue?.value }),
  ]);
  const contentCardUrl = generateContentUrl(content?.slug || '', sitecoreContext);

  const readTimeValue = content.readTime?.jsonValue?.value;
  const contentTypeValue = content?.contentType?.jsonValue?.value;
  const readTimeText = formatReadTime(readTimeValue, contentTypeValue);

  const tagsData = useMemo(() => {
    const topic = content?.topics?.[0];
    const industry = content?.industries?.[0];

    return {
      industries: {
        jsonValue: {
          displayName: industry?.name || '',
          fields: { Slug: { value: industry?.slug || '' } },
        },
      },
      topics: {
        jsonValue: {
          displayName: topic?.name || '',
          fields: { Slug: { value: topic?.slug || '' } },
        },
      },
    };
  }, [content?.topics, content?.industries]);

  return (
    <div className="multi-author-card-container">
      {content?.image?.value?.src && (
        <Link href={contentCardUrl} className="multi-author-card-image-wrapper">
          <ImageItem
            usePlaceholderFallback
            field={content?.image}
            nextImageSrc={content.image?.value?.src}
            className="multi-author-card-image"
          />
        </Link>
      )}
      <div>
        <div className={`tags-container ${isBlockWithCards ? 'dark-theme-tags-container' : ''}`}>
          <TaxonomyTags isDark item={tagsData} />
        </div>
        <Link href={contentCardUrl}>
          <Heading
            richText
            level={4}
            className={`multi-author-card-title ${isBlockWithCards ? 'dark-mode-card' : ''}`}
            field={content?.title}
          />
        </Link>
        <ContentMeta
          isDark={isBlockWithCards}
          contentType={content?.contentType?.jsonValue?.value || ''}
          contentLink={(contentTypeUrl as string) || ''}
          contentDate={content?.publishedDate?.jsonValue?.value || ''}
          contentReadTime={readTimeText}
        />
      </div>
    </div>
  );
};

const FeatureCardButton = ({ featuredCardCta }: { featuredCardCta?: CTAField }) => {
  if (!featuredCardCta?.jsonValue && !featuredCardCta?.jsonValue?.value) {
    return <></>;
  }

  return (
    <LinkItem
      className="feature-card-cta-button"
      field={featuredCardCta?.jsonValue}
      value={featuredCardCta?.jsonValue?.value}
      icon={<span className="play-icon" aria-label="play" />}
    />
  );
};

export default BannerWithCards;
