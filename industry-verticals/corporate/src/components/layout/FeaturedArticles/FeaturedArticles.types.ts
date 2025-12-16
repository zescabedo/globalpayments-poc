import { TaxonomyItem } from '@/components/Uptick/TaxonomyTags/TaxonomyTags.type';
import { ComponentParams, ComponentRendering } from '@sitecore-jss/sitecore-jss-nextjs';

export interface FeaturedArticlesProps {
  params: ComponentParams;
  rendering: ComponentRendering & {
    componentName: string;
    fields: { data: { item: { featuredArticles: { targetItems: TargetItem[] } } } };
  };
}

export interface TargetItem {
  id: string;
  name: string;
  title: JsonValue;
  slug: JsonValue;
  contentReadTime: JsonValue;
  url: { path?: string };
  contentPublishedDate: JsonValue;
  contentMainImage: ImageObject;
  topics?: { jsonValue: TaxonomyItem[] };
  industries: { jsonValue: TaxonomyItem[] };
  contentType: { jsonValue: TaxonomyItem };
}
