export type ContentMetaVariant = 'default' | 'author';

export interface ContentMetaProps {
  isDark?: boolean;
  contentType: string;
  authorLink?: string;
  contentLink: string;
  authorName?: string;
  contentDate: string;
  variant?: ContentMetaVariant;
  contentReadTime?: string;
  className?: string;
  useAnchor?: boolean;
}
