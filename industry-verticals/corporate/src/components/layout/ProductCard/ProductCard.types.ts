import { CtaGroupInterface } from '@/components/ui/CTA/cta.types';
import { ComponentParams, ComponentRendering, ImageField } from '@sitecore-jss/sitecore-jss-nextjs';
export interface ProductCardProps {
  rendering: ComponentRendering & { params: ComponentParams } & { fields: Field };
  params: {
    titleFontSize: string;
    tagFontSize: string;
    [key: string]: string;
  };
}
export interface BackgroundColorVariant {
  targetItem: {
    value: JsonValue;
  };
}
export interface MainImage {
  jsonValue: ImageField;
  src: string;
  alt: string;
  height: number;
  width: number;
}
export interface MainVideo {
  jsonValue: {
    value: {
      href: string;
    };
  };
}
export interface ChildResult extends CtaGroupInterface {
  id: string;
  title: JsonValue;
  tag: JsonValue;
  details: JsonValue;
  backgroundColorVariant: BackgroundColorVariant;
  mainImage: MainImage;
  mainMdImage: MainImage;
  mainSmImage: MainImage;
  mainVideo: MainVideo;
  mainTitleTextColor: {
    jsonValue: {
      fields: {
        Value: {
          value: string;
        };
      };
    };
  };
}

export interface Field {
  data: {
    item: {
      children: {
        results: ChildResult[];
      };
    };
  };
}
