import { Field } from '@sitecore-jss/sitecore-jss-nextjs';
import { BaseComponentFields } from './ArticleDetail.types';

export interface TitleBlockFields extends BaseComponentFields {
  'Heading Level': {
    fields : {
      Value : Field<string>;
    };
  };
  Highlight: Field<boolean>;
  Title: Field<string>;
}

export interface TitleBlockProps {
  fields: TitleBlockFields;
}
