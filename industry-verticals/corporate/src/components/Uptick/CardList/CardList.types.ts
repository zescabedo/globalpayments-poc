import { inherits } from 'util';
import { CardFields } from './Card.types';
import {
  ComponentParams,
  ComponentRendering,
  Field,
  LinkField,
  RichTextField,
} from '@sitecore-jss/sitecore-jss-nextjs';

export interface CardListFields {
  title: RichTextField;
  subtitle: RichTextField;
  ctaLink?: LinkField;
  cards: CardFields[];
}

export interface CardListProps {
  rendering: ComponentRendering;
  params: ComponentParams;
  fields: CardListFields;
}

export interface TargetItemFilter {
  id: string;
  title: Field<string>;
  slug: Field<string>;
}

export interface SearchResultCardListFields {
  data: {
    item: {
      componentTitle: JsonValue;
      componentSubTitle?: JsonValue;
      contentTypeFilter?: {
        targetItems?: TargetItemFilter[];
      };
      exploreCtaText: JsonValue;
      exploreCtaLink: LinkField;
      itemsToShow?: { value?: string | number };
      loadMoreText?: JsonValue;
      loadingText?: JsonValue;
    };
  };
}

export interface SearchResultAuthorCardListFields extends SearchResultCardListFields {
  data: SearchResultCardListFields['data'] & {
    item: SearchResultCardListFields['data']['item'] & {
      fetchSMEList: JsonValue;
    };
  };
}

export interface SearchResultRelatedContentCardFields {
  data: {
    item: {
      componentTitle: Field<string>;
      exploreCtaText: Field<string>;
      exploreCtaLink: LinkField;
      itemsToShow?: { value?: string | number };
      excludeSameContentType?: { value?: string | boolean };
      overrideSameTag?: { targetItems?: { id?: string; url?: { path?: string } }[] };
      overrideOtherTag?: { targetItems?: { id?: string; url?: { path?: string } }[] };
      contentTypeFilter?: {
        targetItems?: TargetItemFilter[];
      };
    };
  };
}
