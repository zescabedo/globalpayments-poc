import { Field } from '@sitecore-jss/sitecore-jss-nextjs';
import { BaseComponentFields } from './ArticleDetail.types';

export interface TextBlockFields extends BaseComponentFields {
  Text?: Field<string>;
  Highlight: { value: boolean };
}

export interface TextBlockProps {
  fields: TextBlockFields;
}
