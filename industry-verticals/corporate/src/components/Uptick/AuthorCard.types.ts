import { UptickTaxonomyItem } from '@/components/Uptick/UptickTaxonomy.types';

import {
  Field,
  LinkField,
  ImageField,
  ComponentParams,
  ComponentRendering,
  RichTextField,
} from '@sitecore-jss/sitecore-jss-nextjs';

//API Author type
export type AuthorLite = {
  id: string;
  biography?: Field<string>;
  name?: string;
  photoUrl?: string;
  areasOfExpertise?: string[];
  longBiographyTitle?: Field<string>;
  longBiographySubtitle?: Field<string>;
  longBiographyContent?: Field<string>;
};

export interface SMEContentBlockFields {
  title: Field<string>;
  subtitle: Field<string>;
  content: RichTextField;
}

export interface AuthorCardFields {
  givenName: Field<string>;
  surname: Field<string>;
  biography: RichTextField;
  areasOfExpertise: UptickTaxonomyItem[];
  contentListingUrl: LinkField;
  image: ImageField;

  authorNameTag: string;

  showContentListingLink: boolean; // Check if we actually need this or not
  isSME?: boolean; // is Author also a SME
  longBiographyTitle?: Field<string>;
  longBiographySubtitle?: Field<string>;
  longBiographyContent?: RichTextField;
}

export interface AuthorCardProps {
  rendering: ComponentRendering & { params: ComponentParams };
  params: ComponentParams;
  fields: AuthorCardFields;
  fetcherOverride?: (url: string) => Promise<unknown>;
}
