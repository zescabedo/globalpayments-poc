import { CtaGroupInterface } from '@/components/ui/CTA/cta.types';
import { MediaItem } from '@/components/ui/GPMedia/GPMedia.types';
import { ComponentParams } from '@sitecore-jss/sitecore-jss-nextjs';
interface MediaBannerItem extends CtaGroupInterface {
  brow: JsonValue;
  details: JsonValue;
  legalText: JsonValue;
  tag: JsonValue;
  title: JsonValue;
  focusXMobile: JsonValue;
  focusYMobile: JsonValue;
  focusYTablet: JsonValue;
  focusXDesktop: JsonValue;
  focusXTablet: JsonValue;
  focusYDesktop: JsonValue;
  mediaSize?: {
    targetItem: {
      Value: {
        jsonValue: {
          value: string;
        };
      };
    };
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
