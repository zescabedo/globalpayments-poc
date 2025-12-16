import { CtaGroupInterface } from '@/components/ui/CTA/cta.types';
import { ComponentParams, LinkField } from '@sitecore-jss/sitecore-jss-nextjs';

interface AccordionItem extends CtaGroupInterface {
  triggerGoal?: {
    jsonValue: {
      id: string;
    };
  };
  triggerCampaign?: {
    jsonValue: { id: string };
  };
  trayHeading: JsonValue;
  trayContent: JsonValue;
  traySubheading: JsonValue;
  ctaTitle?: JsonValue;
  ctaLink?: { jsonValue: LinkField };
  overrideActionStyle?: {
    targetItem: {
      value: JsonValue;
    };
  };
}

interface Fields {
  data: {
    item: {
      title: JsonValue;
      enableFAQSchema: JsonValueBoolean;
      accordionItems: {
        results: AccordionItem[];
      };
    };
  };
}

export interface AccordionProps {
  params: ComponentParams;
  fields: Fields;
}
