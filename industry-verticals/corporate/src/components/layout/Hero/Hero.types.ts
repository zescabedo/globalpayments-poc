import { CtaGroupInterface } from '@/components/ui/CTA/cta.types';
import { MediaItem } from '@/components/ui/GPMedia/GPMedia.types';
import {
  ComponentParams,
  ComponentRendering,
  RichTextField,
} from '@sitecore-jss/sitecore-jss-nextjs';

interface HeroItem extends CtaGroupInterface {
  id?: string;
  backgroundVideo: { jsonValue: { value: VideoObject } };
  brow: { jsonValue: RichTextField };
  details: { jsonValue: RichTextField };
  tag: { jsonValue: RichTextField };
  title: { jsonValue: RichTextField };
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

interface Fields {
  data: {
    item: MediaItem & HeroItem;
  };
}

export interface HeroProps {
  rendering: ComponentRendering & { params: ComponentParams };
  params: ComponentParams;
  fields: Fields;
}
