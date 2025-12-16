import { LinkFieldValue } from '@sitecore-jss/sitecore-jss-dev-tools';
import { ComponentParams, ComponentRendering } from '@sitecore-jss/sitecore-jss-nextjs';
import { ContentItem, TaxonomyItem } from '../TaxonomyTags/TaxonomyTags.type';
import { CardFields } from '../CardList/Card.types';

export interface ContentTypeResponse {
  contentTypeSelection?: {
    jsonValue?: TaxonomyItem;
    targetItem?: {
      id?: string;
      name?: string;
    };
  };
  enableFeaturedCard?: JsonValueBoolean;
  enableListCards?: JsonValueBoolean;
  listCardsTitle: JsonValue;
  featuredCardCta?: CTAField;
}

export interface BannerWithCardsProps {
  rendering: ComponentRendering & { params: ComponentParams };
  params?: ComponentParams;
  fields?: { data?: { item?: ContentTypeResponse } };
}

export type FeaturedCardProps = {
  featuredArticle: CardFields;
  featuredContentTagsData: ContentItem;
  contentTypeName: string;
  contentTypeLink: string;
  featuredCardCta?: CTAField;
};

export interface CategoryTag {
  id?: string;
  url?: string;
  name?: string;
  displayName?: string;
  fields?: { Title: ValueField; Slug: ValueField };
}

export interface ContentResult {
  id?: string;
  title?: string;
  contentTitle?: string;
  contentPublishedDate?: string;
  contentCardImage: ImageObject;
  contentMainImage: ImageObject;
  contentSummary?: string;
  readTime?: string;
  content?: string;
  primaryCTA: LinkFieldValue;
  author?: TaxonomyItem;
  contentType?: string;
  topics?: CategoryTag;
  industries?: CategoryTag;
  url?: { path?: string };
  parent?: { name?: string; url?: { path?: string } };
}
