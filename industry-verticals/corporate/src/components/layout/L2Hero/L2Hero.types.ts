import { CtaGroupInterface } from '@/components/ui/CTA/cta.types';
import { MediaItem } from '@/components/ui/GPMedia/GPMedia.types';
import {
  ComponentParams,
  ComponentRendering,
  RichTextField,
} from '@sitecore-jss/sitecore-jss-nextjs';
interface FieldItem extends CtaGroupInterface {
  brow: { jsonValue: RichTextField };
  details: { jsonValue: RichTextField };
  tag: { jsonValue: RichTextField };
  title: { jsonValue: RichTextField };
  legalText: JsonValue;
  focusXMobile: JsonValue;
  focusYMobile: JsonValue;
  focusYTablet: JsonValue;
  focusXDesktop: JsonValue;
  focusXTablet: JsonValue;
  focusYDesktop: JsonValue;
  trustpilotSnippetCode: { jsonValue: {fields: {TrustpilotCode: {value: string}}} };
  mediaSize: {
    targetItem: {
      Value: {
        jsonValue: {
          value: string;
        };
      };
    };
  };
}

interface Fields {
  data: {
    item: MediaItem & FieldItem;
  };
}

export interface L2HeroProps {
  rendering: ComponentRendering & { params: ComponentParams };
  params: ComponentParams;
  fields: Fields;
}
