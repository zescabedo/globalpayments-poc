import {
  ComponentRendering,
  ImageFieldValue,
  Item,
  LinkField,
} from '@sitecore-jss/sitecore-jss-nextjs';

export interface SearchTagResultsProps {
  rendering: ComponentRendering & {
    fields?: { data: SearchTagResultsFields };
  };
}

export interface QueryParamConfig {
  contentTypeParam?: string;
  productParam?: string;
  topicParam?: string;
}

export interface SearchTagResultsFields {
  content?: ContentListing;
  searchResultTag?: SearchTagResult;
  searchFilterBar?: SearchTagResult;
}

export interface ContentListing {
  total: number;
}

export interface SearchTagResult {
  title?: JsonValue;
  clearFilterButtonText?: JsonValue;
  chooseyourMedium?: JsonValue;
  chooseyourProduct?: JsonValue;
  chooseyourTopic?: JsonValue;
  noResultText?: JsonValue;
}

export interface ContentListingResult {
  search: {
    total: number;
    pageInfo: { endCursor: string; hasNext: boolean };
    results: Result[];
  };
}

export interface Result {
  id?: string;
  slug?: JsonValue;
  primaryCTA?: CTALink;
  url: { path: string };
  contentTitle?: JsonValue;
  contentSummary?: JsonValue;
  author?: { jsonValue: Item | null };
  contentType?: { jsonValue: ContentFields };
  topics?: { jsonValue: ContentFields[] };
  industries?: { jsonValue: ContentFields[] };
  products?: { jsonValue: ContentFields[] };
  contentPublishedDate?: JsonValue;
  readTime?: JsonValue;
  contentCardImage?: JsonValue & ImageFieldValue;
  contentMainImage?: JsonValue & ImageFieldValue;
}

export interface ContentFields {
  id: string;
  url: string;
  name: string;
  displayName: string;
  fields: { Title: ValueField; Slug: ValueField };
}

export interface EditableLinkField extends LinkField {
  editable?: string;
}

export interface FilterTag {
  value: string;
  name: string;
  slug: string;
}

export interface FilterTags {
  contentTypes: FilterTag[];
  topics: FilterTag[];
  products: FilterTag[];
}

export type FilterKeys = 'contentTypes' | 'products' | 'topics';

export type SelectedFilters = {
  contentTypes: Map<string, FilterTag>;
  products: Map<string, FilterTag>;
  topics: Map<string, FilterTag>;
};

export type SearchConditionInput = {
  name: string;
  value: string;
  operator: 'EQ' | 'CONTAINS';
};
