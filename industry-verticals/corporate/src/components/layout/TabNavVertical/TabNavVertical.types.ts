import { MediaItem } from '@/components/ui/GPMedia/GPMedia.types';
import { ComponentParams, ComponentRendering } from '@sitecore-jss/sitecore-jss-nextjs';
export interface TabNavProps {
  rendering: ComponentRendering & { params: ComponentParams } & { fields: TabNavVerticalField };
  params: {
    [key: string]: string;
  };
}

export interface TabNavVerticalChild {
  id?: string;
  tabToggleHeading: JsonValue;
  tabTitle: JsonValue;
  tabTag: JsonValue;
  tabFootnote: JsonValue;
  tabRichtext: JsonValue;
}

export interface TabNavVerticalField {
  data: {
    item: MediaItem & {
      Title: JsonValue;
      Tag: JsonValue;
      children: {
        results: TabNavVerticalChild[];
      };
    };
  };
}
