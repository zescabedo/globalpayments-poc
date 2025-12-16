import { ComponentParams, ComponentRendering } from '@sitecore-jss/sitecore-jss-nextjs';
import { CtaGroupInterface } from '@/components/ui/CTA/cta.types';
import { MediaItem } from '@/components/ui/GPMedia/GPMedia.types';
import { RichTextField } from '@sitecore-jss/sitecore-jss-nextjs';
export interface QuoteCopyCardProps {
  rendering: ComponentRendering & { params: ComponentParams } & { fields: Field };
  params: {
    [key: string]: string;
  };
}

interface FieldDataItem extends CtaGroupInterface {
  title: { jsonValue: RichTextField };
  tag: { jsonValue: RichTextField };
  details: { jsonValue: RichTextField };
  calloutTitle: JsonValue;
  calloutTag: JsonValue;
  quote: JsonValue;
  quoteAuthor: { jsonValue: RichTextField };
  quoteAuthorTag: { jsonValue: RichTextField };
  backgroundVideo: JsonValue & {
    jsonValue: {
      value: {
        href: string;
      };
    };
  };
  gaOverrideTagging: JsonValue;
  quoteLogo: ImageObject;
}

export type Field = {
  data: {
    item: MediaItem & FieldDataItem;
  };
};
