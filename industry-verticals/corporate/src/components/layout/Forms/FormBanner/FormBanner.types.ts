import {
  ComponentParams,
  ComponentRendering,
  RichTextField,
} from '@sitecore-jss/sitecore-jss-nextjs';
import { ReactNode } from 'react';

export interface FormBannerProps {
  rendering: ComponentRendering & { params: ComponentParams };
  params: ComponentParams;
  fields: Fields;
  placeholders: Record<string, ReactNode>;
}

export type Fields = {
  data: {
    item: {
      title: { jsonValue: RichTextField };
      tag: { jsonValue: RichTextField };
      details: { jsonValue: RichTextField };
    };
  };
};
