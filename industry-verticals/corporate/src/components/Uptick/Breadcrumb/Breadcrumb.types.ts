import { ComponentParams, ComponentRendering } from '@sitecore-jss/sitecore-jss-nextjs';

export interface Industry {
  Title?: string;
  Slug?: string;
  BreadcrumbLabel?: string;
  id?: string;
  name?: string;
}
export interface BreadcrumbProps {
  rendering: ComponentRendering & { params: ComponentParams };
  params: ComponentParams;
  fields: Fields;
}
export type Fields = {
  data: {
    item: {
      searchPlaceholder: JsonValue;
      allContentLabel: JsonValue;
      authorsLabel: JsonValue;
      rootTitle: JsonValue;
      uptickRootNode: {
        targetItem: {
          url: {
            path: string;
          };
        };
      };
      searchIcon?: ImageObject;
    };
  };
};
