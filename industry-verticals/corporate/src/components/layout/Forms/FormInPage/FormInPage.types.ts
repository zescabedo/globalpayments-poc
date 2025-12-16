import {
  ComponentParams,
  ComponentRendering,
  LinkField,
  RichTextField,
} from '@sitecore-jss/sitecore-jss-nextjs';
import { ReactNode } from 'react';

export interface FormInPageProps {
  rendering: ComponentRendering & { params: ComponentParams };
  params: ComponentParams;
  fields: Fields;
  placeholders: Record<string, ReactNode>;
  className?: string;
}

export type Fields = {
  data: {
    item: {
      title: { jsonValue: RichTextField };
      tag: { jsonValue: RichTextField };
      details: { jsonValue: RichTextField };
      formIntroDescription: { jsonValue: RichTextField };
      logoText: { jsonValue: RichTextField };
      logo: ImageObject;
      ctaTitle?: JsonValue;
      ctaLink?: { jsonValue: LinkField };
      overrideActionStyle?: {
        targetItem: {
          value: JsonValue;
        };
      };
    };
  };
};
