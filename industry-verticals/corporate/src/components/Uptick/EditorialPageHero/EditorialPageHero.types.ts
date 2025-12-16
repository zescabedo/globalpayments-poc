import {
  ComponentParams,
  ComponentRendering,
  Field,
  LinkField,
} from '@sitecore-jss/sitecore-jss-nextjs';

export interface SecondaryNavigationItem {
  text: string | null;
  url: string | null;
  target: string | null;
  linkType: string | null;
  anchor: string | null;
}

interface NavContentItem {
  id: string;
  name: string;
  path: string;
  listingPageCta: {
    jsonValue: LinkField;
  };
  title: JsonValue;
  slug: JsonValue;
  displayTitle: JsonValue;
}

export interface SecondaryNavigationData {
  id?: string;
  title?: {
    jsonValue: Field<string>;
  };
  tagline?: {
    jsonValue: Field<string>;
  };
  allContentCta?: {
    targetItem?: {
      id: string;
      name: string;
      url: {
        path: string;
      };
    };
  };
  allContentCtaLabel?: JsonValue;
  contentTypes?: {
    targetItems: NavContentItem[];
  };
  searchIcon?: ImageObject;
  searchPlaceholder?: JsonValue;
}

export interface SecondaryNavigationProps {
  fields?: {
    data?: {
      item?: SecondaryNavigationData;
    };
  };
  className?: string;
  rendering: ComponentRendering & { params: ComponentParams } & { fields: Field };
  params: {
    [key: string]: string;
  };
}
