import { UptickTaxonomyItem } from '@/components/Uptick/UptickTaxonomy.types';

import {
  Field,
  LinkField,
  DateField,
  ImageField,
  ComponentParams,
  ComponentRendering,
  RichTextField,
} from '@sitecore-jss/sitecore-jss-nextjs';

export interface ArticleBannerFields {
  title: RichTextField;
  description: RichTextField;
  cta: LinkField;
  contentType: Field<string>;
  contentTypeLink: string;
  authorName: Field<string>;
  authorLink: LinkField;
  publishDate: DateField;
  readTime: Field<string>;
  image: ImageField;
  social: boolean;
  taxonomy: UptickTaxonomyItem[];
}

export interface ArticleBannerProps {
  rendering: ComponentRendering & { params: ComponentParams };
  params: ComponentParams;
  fields: ArticleBannerFields;
}
