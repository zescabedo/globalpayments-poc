import { ComponentParams, ComponentRendering } from '@sitecore-jss/sitecore-jss-nextjs';
import { CtaGroupInterface } from '@/components/ui/CTA/cta.types';

export interface TableOfferMatrixProps {
  rendering: ComponentRendering & { params: ComponentParams } & { fields: Field };
  params: {
    [key: string]: string;
  };
}

interface CheckmarkImage {
  jsonValue: {
    value: {
      src: string;
      alt: string;
    };
  };
  src: string;
  alt: string;
  height: number | null;
  width: number | null;
}
export interface Feature {
  detail: JsonValue;
  categories: JsonValue;
  column1Checkmark: JsonValueBoolean;
  column2Checkmark: JsonValueBoolean;
  column3Checkmark: JsonValueBoolean;
  [key: string]: JsonValue | JsonValueBoolean;
}
export interface ItemFieldData extends CtaGroupInterface {
  compareType: string;
  overrideActionStyle: {
    targetItem: {
      value: JsonValue;
    };
  };
  descriptionHeading: JsonValue;
  descriptionSubHeading: JsonValue;
  title: JsonValue;
  tag: JsonValue;
  details: JsonValue;
  column1Heading: JsonValue;
  column1Subheading: JsonValue;
  column2Heading: JsonValue;
  column2Subheading: JsonValue;
  column3Heading: JsonValue;
  column3Subheading: JsonValue;
  checkmarkImage: CheckmarkImage;
  children: {
    results: Feature[];
  };
}
export interface Field {
  data: {
    item: ItemFieldData;
  };
}
