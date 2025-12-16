import { LinkField, ComponentParams } from '@sitecore-jss/sitecore-jss-nextjs';

export interface ContentListProps {
  fields: {
    data?: {
      item?: {
        contentItems?: {
          results?: Array<{
            id: string;
            title?: JsonValue;
            tag?: JsonValue;
            details?: JsonValue;
            detailsSize?: { jsonValue?: { fields?: { Value?: { value?: string } } } };
            linkList?: {
              id: string;
              results?: Array<{
                id: string;
                links?: {
                  results?: Array<{
                    id: string;
                    link?: {
                      id: string;
                      jsonValue?: LinkField;
                    };
                  }>;
                };
              }>;
            };
            tagSize?: { jsonValue?: { fields?: { Value?: { value?: string } } } };
          }>;
        };
        id?: string;
        title?: JsonValue;
        titleSize?: { jsonValue?: { fields?: { Value?: { value?: string } } } };
        tag?: JsonValue;
        tagSize?: { jsonValue?: { fields?: { Value?: { value?: string } } } };
        details?: JsonValue;
        detailsSize?: { jsonValue?: { fields?: { Value?: { value?: string } } } };
      };
    };
  };
  params: ComponentParams;
}
