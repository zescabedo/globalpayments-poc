import { ComponentParams } from '@sitecore-jss/sitecore-jss-nextjs';

export interface BaseComponentFields {
  id: string;
  componentType: string;
}

export interface ArticleDetailProps {
  fields: {
    Components: BaseComponentFields[];
  };
}

export interface FactoryProps<T extends BaseComponentFields = BaseComponentFields> {
  fields: T;
  params?: ComponentParams;
}
