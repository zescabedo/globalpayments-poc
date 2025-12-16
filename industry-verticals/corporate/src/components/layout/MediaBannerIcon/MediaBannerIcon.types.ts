import { CtaGroupInterface } from '@/components/ui/CTA/cta.types';
import { MediaItem } from '@/components/ui/GPMedia/GPMedia.types';
import { ComponentParams, ComponentRendering } from '@sitecore-jss/sitecore-jss-nextjs';
export interface MediaBannerIconListProps {
  rendering: ComponentRendering & { params: ComponentParams } & { fields: MediaBannerIconField };
  params: {
    [key: string]: string;
  };
}

export interface MainVideo {
  jsonValue: {
    value: {
      href: string;
    };
  };
}

export interface IconItem {
  iconTitle: JsonValue;
  iconColourVariant: { targetItem: { value: JsonValue } };
  icon: { jsonValue: { url: string } };
  iconDetails: JsonValue;
  id: string;
}

export interface Icons {
  targetItems: IconItem[];
}

interface MediaBannerIconFieldItem extends CtaGroupInterface {
  brow: JsonValue;
  title: JsonValue;
  tag: JsonValue;
  icons: Icons;
  focusXMobile: JsonValue;
  focusYMobile: JsonValue;
  focusYTablet: JsonValue;
  focusXDesktop: JsonValue;
  focusXTablet: JsonValue;
  focusYDesktop: JsonValue;
}

export interface MediaBannerIconField {
  data: {
    item: MediaItem & MediaBannerIconFieldItem;
  };
}
