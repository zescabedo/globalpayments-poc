import { CtaGroupInterface } from '@/components/ui/CTA/cta.types';
import { ComponentParams, ComponentRendering } from '@sitecore-jss/sitecore-jss-nextjs';

export interface IconCardListProps {
  rendering: ComponentRendering & { params: ComponentParams } & { fields: Field };
  params: {
    [key: string]: string;
  };
  cssClass?: string;
}

export interface ChildResult extends CtaGroupInterface {
  id: string;
  title: JsonValue;
  details: JsonValue;
  tag: JsonValue;
  icon: { jsonValue: { url: string } };
  mainImage: ImageObject;
  iconColourVariant: { targetItem: { value: JsonValue } };
}

interface FieldItem extends CtaGroupInterface {
  listTitle: JsonValue;
  children: {
    results: ChildResult[];
  };
}

export interface Field {
  data: {
    item: FieldItem;
  };
}
