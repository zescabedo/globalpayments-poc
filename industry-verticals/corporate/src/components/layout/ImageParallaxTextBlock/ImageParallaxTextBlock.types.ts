import {
  ComponentParams,
  ComponentRendering,
  RichTextField,
} from '@sitecore-jss/sitecore-jss-nextjs';
import { CtaGroupInterface } from '../../ui/CTA/cta.types';

interface Item extends CtaGroupInterface {
  details: { jsonValue: RichTextField };
  tag: { jsonValue: RichTextField };
  title: { jsonValue: RichTextField };
  mainImage: ImageObject;
  mainMdImage: ImageObject;
  mainSmImage: ImageObject;
  focusXMobile: JsonValue;
  focusYMobile: JsonValue;
  focusYTablet: JsonValue;
  focusXDesktop: JsonValue;
  focusXTablet: JsonValue;
  focusYDesktop: JsonValue;
  textboxBackgroundColor?: {
    jsonValue: {
      id: string;
      url: string;
      name: string;
      displayName: string;
      fields: {
        Value: {
          value: string;
          editable: string;
        };
      };
    };
  };
  mediaSize?: {
    targetItem: {
      Value: {
        jsonValue: {
          value: string;
        };
      };
    };
  };
  ctasParent: CtaGroupInterface['ctasParent'];
}

interface Fields {
  data: {
    item: Item;
  };
}

export interface ImageParallaxTextBlock {
  rendering: ComponentRendering & { params: ComponentParams };
  params: ComponentParams;
  fields: Fields;
}
