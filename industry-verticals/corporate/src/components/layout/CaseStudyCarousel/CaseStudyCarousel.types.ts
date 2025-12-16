import { CtaGroupInterface } from '@/components/ui/CTA/cta.types';
import {
  ComponentParams,
  ComponentRendering,
  RichTextField,
} from '@sitecore-jss/sitecore-jss-nextjs';

export interface Item extends CtaGroupInterface {
  details: { jsonValue: RichTextField };
  tag: { jsonValue: RichTextField };
  title: { jsonValue: RichTextField };
  caseStudyCards: {
    results: CaseStudyCard[];
  };
}

export interface Fields {
  data: {
    item: Item;
  };
}

export interface CaseStudyCard extends CtaGroupInterface {
  id?: string;
  authorName: JsonValue;
  authorTag: JsonValue;
  overlayLogo: ImageObject;
  categoryTag: JsonValue;
  details: { jsonValue: RichTextField };
  tag: { jsonValue: RichTextField };
  title: { jsonValue: RichTextField };
  gaOverrideTagging: JsonValue;
  backgroundImage: ImageObject;
  backgroundMdImage: ImageObject;
  backgroundSmImage: ImageObject;
  mainImage: ImageObject;
  mainMdImage: ImageObject;
  mainSmImage: ImageObject;
}

export interface CaseStudyCarouselProps {
  rendering: ComponentRendering & { params: ComponentParams };
  params: ComponentParams;
  fields: Fields;
}
