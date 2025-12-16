import { CtaGroupInterface } from '@/components/ui/CTA/cta.types';
import {
  ComponentParams,
  ComponentRendering,
  LinkField,
  RichTextField,
} from '@sitecore-jss/sitecore-jss-nextjs';

export interface CardItem extends CtaGroupInterface {
  id: string;
  title: { jsonValue: RichTextField };
  tag: { jsonValue: RichTextField };
  details: { jsonValue: RichTextField };
  mainImage: ImageObject;
  mainMdImage: ImageObject;
  mainSmImage: ImageObject;
  mainVideo: {
    jsonValue: {
      value: {
        href: string;
      };
    };
  };
  vidyardId: JsonValue;
  productName: { jsonValue: RichTextField };
  productPrice: { jsonValue: RichTextField };
  productRequestLink: {
    jsonValue: LinkField;
  };
  productRequestLinkCtaStyle: {
    targetItem: {
      value: JsonValue;
    };
  };
  featureTitle: { jsonValue: RichTextField };
  productFeatures: { jsonValue: RichTextField };
  productNotes: { jsonValue: RichTextField };
  showTopCTA: JsonValueBoolean;
  showBottomCTA: JsonValueBoolean;
}

interface FieldDataItem extends CtaGroupInterface {
  title: { jsonValue: RichTextField };
  tag: { jsonValue: RichTextField };
  details: { jsonValue: RichTextField };
  children: {
    results: CardItem[];
  };
}

interface Fields {
  data: {
    item: FieldDataItem;
  };
}

export interface SelectorBundleCardsProps {
  rendering: ComponentRendering & { params: ComponentParams };
  params: ComponentParams;
  fields: Fields;
}
