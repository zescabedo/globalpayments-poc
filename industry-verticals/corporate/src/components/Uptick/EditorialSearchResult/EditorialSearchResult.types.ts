import { ComponentParams, ComponentRendering } from '@sitecore-jss/sitecore-jss-nextjs';

export interface EditorialSearchResultProps {
  rendering: ComponentRendering & { params: ComponentParams };
  params: ComponentParams;
  fields: Fields;
}

type Fields = {
  data: {
    item: {
      title: JsonValue;
    };
  };
};
