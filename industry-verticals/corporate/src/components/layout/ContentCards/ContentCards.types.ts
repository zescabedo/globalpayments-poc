import { CtaGroupInterface } from '@/components/ui/CTA/cta.types';
import { ComponentParams, ComponentRendering } from '@sitecore-jss/sitecore-jss-nextjs';

export interface ContentCardsProps {
  rendering: ComponentRendering & { params: ComponentParams } & { fields: Field };
  params: {
    [key: string]: string;
    tagFontSize: string;
    descriptionFontSize: string;
    browFontSize: string;
    titleFontSize: string;
  };
}

export interface BackgroundColorVariant {
  targetItem: {
    value: JsonValue;
  };
}

export interface ChildResult extends CtaGroupInterface {
  id: string;
  title: JsonValue;
  tag: JsonValue;
  details: JsonValue;
  cta: CTAField;
  backgroundColorVariant: BackgroundColorVariant;
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
