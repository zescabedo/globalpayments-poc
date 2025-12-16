import { ComponentParams, ComponentRendering } from '@sitecore-jss/sitecore-jss-nextjs';

export interface GoBackProps {
  rendering: ComponentRendering & { params: ComponentParams };
  params: ComponentParams;
  fields: Fields;
}
export type Fields = {
  data: {
    item: {
      linkOverride: {
        targetItem: {
          url: { path: string };
        };
      };
      backToLabel: JsonValue;
      labelOverride: JsonValue;
      hideWhenTargetIsHome: JsonValueBoolean;
    };
  };
};
