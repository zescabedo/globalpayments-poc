import { ComponentParams, LinkField } from '@sitecore-jss/sitecore-jss-nextjs';
import { BaseComponentFields } from './ArticleDetail.types';

export interface TwoColumnQuoteBlockFields extends BaseComponentFields {
  Testimonial: { value: string };
  Author: { value: string };
  'Author Position': { value: string };
  'Author Company': { value: string };
  Text: { value: string };
  'Company Logo': {
    value: { src: string; alt: string };
  };
  'Add Social Media Link': { value: boolean };
  'Social Media Link': LinkField;
  'Display Type': {
    fields: { Value: { value: string } };
  };
}

export interface TwoColumnQuoteBlockProps {
  params: ComponentParams;
  fields: TwoColumnQuoteBlockFields;
}
