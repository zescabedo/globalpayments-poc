import { AuthorRef, Taxo } from '@/lib/uptick/mappers';
import { UptickTaxonomyItem } from '../UptickTaxonomy.types';

import {
  Field,
  LinkField,
  ImageField,
  ComponentParams,
  ComponentRendering,
  RichTextField,
  LinkFieldValue,
} from '@sitecore-jss/sitecore-jss-nextjs';

export interface CardFields {
  title: Field<string>;
  description: RichTextField;
  taxonomies: UptickTaxonomyItem[];
  contentListingUrl: LinkField;
  image: ImageField;
  contentType: JsonValue;
  publishedDate: JsonValue;
  readTime: JsonValue;
  authors?: AuthorRef[];
  summary?: string;
  industries?: Taxo[];
  topics?: Taxo[];
  primaryCTA?: LinkFieldValue;
  authorNameTag: string;
  showContentListingLink: boolean; // Check if we actually need this or not
  id?: string;
  slug?: string;
}

export interface CardListItemProps {
  rendering: ComponentRendering & { params: ComponentParams };
  params: ComponentParams;
  fields: CardFields;
}
