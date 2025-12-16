import { Field, LinkField } from '@sitecore-jss/sitecore-jss-nextjs';

export interface UptickTaxonomyItem {
  name: Field<string>;
  link: LinkField;
  isFeatured: Field<boolean>;
  type: Field<string>; // not used, but here in case we decide to style the different taxonomy types differently
  slug?: string; //(Optional) Keep these for richer UIs / filters without more lookups
}

export interface UptickTaxonomyProps {
  taxonomyItems: UptickTaxonomyItem[];
  isForAuthorCard: boolean;
}
