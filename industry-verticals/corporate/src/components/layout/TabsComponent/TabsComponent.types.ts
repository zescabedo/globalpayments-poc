import { ComponentRendering } from '@sitecore-jss/sitecore-jss-nextjs';
export interface TabsProps {
  rendering: ComponentRendering & {
    fields: Field;
  };
  params: {
    [key: string]: string;
    descriptionFontSize: string;
    browFontSize: string;
    titleFontSize: string;
    titleHeadingLevel: string;
  };
}
export interface ChildResult {
  id: string;
  Heading: JsonValue;
  Content: JsonValue;
  placeholderIndex: JsonValue;
}

export interface Field {
  data: {
    item: {
      Title: JsonValue;
      Details: JsonValue;
      children: {
        results: ChildResult[];
      };
    };
  };
}
