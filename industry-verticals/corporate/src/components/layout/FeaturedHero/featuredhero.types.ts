import { CtaGroupInterface } from '@/components/ui/CTA/cta.types';
import {
  ComponentParams,
  ComponentRendering,
  RichTextField,
} from '@sitecore-jss/sitecore-jss-nextjs';

interface Fields extends CtaGroupInterface {
  id?: string;
  backgroundMdImage: ImageObject;
  backgroundSmImage: ImageObject;
  backgroundVideo: { jsonValue: { value: VideoObject } };
  backgroundImage: ImageObject;
  brow: { jsonValue: RichTextField };
  details: { jsonValue: RichTextField };
  tag: { jsonValue: RichTextField };
  title: { jsonValue: RichTextField };
  videoPause: { jsonValue: RichTextField };
  videoPlay: { jsonValue: RichTextField };
  mainImage: ImageObject;
  mainMdImage: ImageObject;
  mainSmImage: ImageObject;
  mainVideo: { jsonValue: { value: VideoObject } };
  vidyardId: JsonValue;
  videoType: {
    jsonValue: {
      id: string;
      url: string;
      name: string;
      displayName: string;
      fields: {
        Value: {
          value: string;
        };
      };
    };
  };
  showVideoInModal: {
    jsonValue: {
      value: boolean;
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

export interface FeaturedHerotypes {
  rendering: ComponentRendering & { params: ComponentParams };
  params: ComponentParams;
  fields: {
    data: {
      item: Fields;
    };
  };
}
