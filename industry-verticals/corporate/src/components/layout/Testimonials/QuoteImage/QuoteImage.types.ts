import { MediaItem } from '@/components/ui/GPMedia/GPMedia.types';
import { ImageField } from '@sitecore-jss/sitecore-jss-nextjs';

export interface JsonImageValue {
  jsonValue: ImageField;
  src: string;
  alt: string;
  width: string;
  height: string;
}

export type Params = {
  backgroundColorVariant: string;
  quoteMarksColorVariant: string;
  DynamicPlaceholderId: string;
  Styles: string;
};

export type Fields = {
  data: {
    item: MediaItem & {
      quote: JsonValue;
      quoteAuthor: JsonValue;
      quoteAuthorTag: JsonValue;
      quoteLogo: JsonImageValue;
    };
  };
};
