import { CtaGroupInterface } from '@/components/ui/CTA/cta.types';
import { MediaItem } from '@/components/ui/GPMedia/GPMedia.types';
import {
  ComponentParams,
  ComponentRendering,
  RichTextField,
} from '@sitecore-jss/sitecore-jss-nextjs';

interface L3HeroFieldItem extends CtaGroupInterface {
  brow: { jsonValue: RichTextField };
  details: { jsonValue: RichTextField };
  tag: { jsonValue: RichTextField };
  title: { jsonValue: RichTextField };
  imageType: {
    targetItem: {
      Value: JsonValue;
    };
  };
  focusXMobile: JsonValue;
  focusYMobile: JsonValue;
  focusYTablet: JsonValue;
  focusXDesktop: JsonValue;
  focusXTablet: JsonValue;
  focusYDesktop: JsonValue;
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
    item: MediaItem & L3HeroFieldItem;
  };
}

export interface L3HeroProps {
  rendering: ComponentRendering & { params: ComponentParams };
  params: ComponentParams;
  fields: Fields;
}
