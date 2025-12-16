import { ComponentParams } from '@sitecore-jss/sitecore-jss-nextjs';
import { BaseComponentFields } from './ArticleDetail.types';

export interface TwoColumnTextBlockFields extends BaseComponentFields {
  'Right Column Text': { value: string };
  'Left Column Text': { value: string };
}

export interface TwoColumnTextBlockProps {
  fields: TwoColumnTextBlockFields;
  params?: ComponentParams;
}
