import { ComponentParams, ComponentRendering } from '@sitecore-jss/sitecore-jss-nextjs';
import { CtaGroupInterface } from '@/components/ui/CTA/cta.types';

export interface PlanSelectorCardsProps {
  rendering: ComponentRendering & { params: ComponentParams } & { fields: Field };
  params: {
    [key: string]: string;
  };
}

export interface PlanSelectorCardResults extends CtaGroupInterface {
  id: string;
  title: JsonValue;
  tag: JsonValue;
  details: JsonValue;
  details2: JsonValue;
}

export interface Field {
  data: {
    item: {
      title: JsonValue;
      disclaimer: JsonValue;
      caseStudyCards: {
        results: PlanSelectorCardResults[];
      };
    };
  };
}
