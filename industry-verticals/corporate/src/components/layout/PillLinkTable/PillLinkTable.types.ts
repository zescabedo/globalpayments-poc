import { MediaItem } from '@/components/ui/GPMedia/GPMedia.types';
import { LinkField, RichTextField } from '@sitecore-jss/sitecore-jss-nextjs';

interface CTALinkObject {
  id: string;
  cta: {
    jsonValue: LinkField;
  };
  description: {
    jsonValue: RichTextField;
  };
}

interface Fields {
  data: {
    item: MediaItem & {
      brow: string;
      details: { jsonValue: RichTextField };
      tag: { jsonValue: RichTextField };
      title: { jsonValue: RichTextField };
      focusXMobile: JsonValue;
      focusYMobile: JsonValue;
      focusYTablet: JsonValue;
      focusXDesktop: JsonValue;
      focusXTablet: JsonValue;
      focusYDesktop: JsonValue;
      ctas: { results: CTALinkObject[] };
    };
  };
}

export interface PillLinkTableProps {
  params: {
    tagFontSize: string;
    descriptionFontSize: string;
    [key: string]: string;
    titleFontSize: string;
  };
  fields: Fields;
}
