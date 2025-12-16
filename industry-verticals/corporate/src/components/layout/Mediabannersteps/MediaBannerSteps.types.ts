import { CtaGroupInterface } from '@/components/ui/CTA/cta.types';
import { MediaItem } from '@/components/ui/GPMedia/GPMedia.types';
import { ComponentParams } from '@sitecore-content-sdk/nextjs';

interface MediaBannerItem extends CtaGroupInterface {
  brow: JsonValue;
  calloutTitle: JsonValue;
  calloutTag: JsonValue;
  details: JsonValue;
  tag: JsonValue;
  title: JsonValue;
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
  steps: {
    targetItems: {
      stepTitle: JsonValue;
      stepDetails: JsonValue;
    }[];
  };
}

export interface MediaBannerProps {
  params: ComponentParams;

  fields: {
    data: {
      item: MediaItem & MediaBannerItem;
    };
  };
}
