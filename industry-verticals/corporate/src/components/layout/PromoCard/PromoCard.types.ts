import { CtaGroupInterface } from '@/components/ui/CTA/cta.types';
import { ComponentParams, ComponentRendering, LinkField } from '@sitecore-jss/sitecore-jss-nextjs';
export interface PromoCardProps {
  rendering: ComponentRendering & { params: ComponentParams } & { fields: Field };
  params: {
    [key: string]: string;
    descriptionFontSize: string;
    titleFontSize: string;
    titleHeadingLevel: string;
  };
}
export interface CTAField {
  jsonValue: LinkField;
}

export interface RenderingParameterValue {
  Value: {
    value: JsonValue;
  };
}

export interface ChildResult extends CtaGroupInterface {
  title: JsonValue;
  tag: JsonValue;
  details: JsonValue;

  backgroundColorVariant: RenderingParameterValue;
  cardBackground: RenderingParameterValue;
  cardStyle: RenderingParameterValue;
  mainImage: ImageObject;
  mainMdImage: ImageObject;
  mainSmImage: ImageObject;
  mainVideo: {
    jsonValue: {
      value: {
        href: string;
      };
    };
  };
  vidyardId: JsonValue;
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
