import { ComponentParams } from '@sitecore-jss/sitecore-jss-nextjs';

export type ContentStatsFields = {
  data: {
    item: {
      contentItems: {
        results: {
          title: {
            jsonValue: {
              value: string;
            };
          };
          tag: {
            jsonValue: {
              value: string;
            };
          };
        }[];
      };
      title: {
        jsonValue: {
          value: string;
        };
      };
    };
  };
};

export type ResultItem = {
  id: string;
  title: {
    jsonValue: {
      value: string;
    };
  };
  tag: {
    jsonValue: {
      value: string;
    };
  };
};

export interface ContentStatProps {
  params: ComponentParams;
  fields: ContentStatsFields;
}
