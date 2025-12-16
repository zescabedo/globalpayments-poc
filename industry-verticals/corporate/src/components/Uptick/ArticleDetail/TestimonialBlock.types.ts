import { ComponentParams, ImageField, LinkField } from '@sitecore-jss/sitecore-jss-nextjs';
import { BaseComponentFields } from './ArticleDetail.types';

export interface TestimonialBlockFields extends BaseComponentFields {
  Testimonial: { value: string };
  Author: { value: string };
  'Author Position': { value: string };
  'Author Company': { value: string };
  'Company Logo': ImageField;
  'Add Social Media Link': { value: boolean };
  'Social Media Link': LinkField;
}

export interface TestimonialBlockProps {
  params: ComponentParams;
  fields: TestimonialBlockFields;
}
