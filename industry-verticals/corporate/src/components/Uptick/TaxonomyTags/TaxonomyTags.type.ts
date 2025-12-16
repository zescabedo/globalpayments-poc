import { Field, LinkField } from '@sitecore-jss/sitecore-jss-nextjs';

export interface TagItem {
  name: string;
  link?: string;
  isFeatured?: boolean;
}

export interface TaxonomyItem {
  id?: string;
  url?: string;
  name?: string;
  displayName?: string;
  fields?: {
    Title?: ValueField;
    Slug?: ValueField;
  };
}

export interface UptickTaxonomyItem {
  name: Field<string>;
  link: LinkField;
  isFeatured: Field<boolean>;
  type: 'audience' | 'topic';
  slug?: string;
}

export interface ContentItem {
  topics?: { jsonValue?: TaxonomyItem[] | TaxonomyItem } | TaxonomyItem;
  industries?: { jsonValue?: TaxonomyItem | TaxonomyItem[] } | TaxonomyItem;
  tags?: UptickTaxonomyItem[];
}

export interface TaxonomyTagsProps {
  tagItems?: TagItem[];
  className?: string;
  item?: ContentItem | null;
  isDark?: boolean;
  isIndustry?: boolean;
  size?: 'base' | 'lg';
}

export interface TagProps extends Omit<TagItem, 'isFeatured'> {
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'featured' | 'default';
  size?: 'base' | 'lg';
}
