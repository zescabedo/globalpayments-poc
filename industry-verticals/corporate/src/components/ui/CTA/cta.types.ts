import { LinkField } from '@sitecore-jss/sitecore-jss-nextjs';

export interface CtaGroupInterface {
  ctasParent?: {
    results: {
      id: string;
      displayIn: {
        targetItem: {
          value: {
            jsonValue?: {
              value: string;
            };
          };
        };
      };
      ctas: {
        results: {
          triggerGoal?: {
            jsonValue: {
              id: string;
            };
          };
          triggerCampaign?: {
            jsonValue: { id: string };
          };
          id: string;
          ctaTitle: JsonValue;
          ctaLink: { jsonValue: LinkField };
          overrideActionStyle: {
            targetItem: {
              value: JsonValue;
            };
          };
          openInModal?: JsonValueBoolean;
          modalTheme?: {
            targetItem: {
              value: JsonValue;
            };
          };
          modalHeight?: JsonValue;
          modalWidth?: JsonValue;
        }[];
      };
    }[];
  };
  ctaTitle?: JsonValue;
  tabIndex?: number;
  ctaLink?: { jsonValue: LinkField };
  overrideActionStyle?: {
    targetItem: {
      value: JsonValue;
    };
  };
  openInModal?: JsonValueBoolean;
  modalTheme?: {
    targetItem: {
      value: JsonValue;
    };
  };
  triggerGoal?: {
    jsonValue: {
      id: string;
    };
  };
  triggerCampaign?: {
    jsonValue: { id: string };
  };
  modalHeight?: JsonValue;
  modalWidth?: JsonValue;
}
