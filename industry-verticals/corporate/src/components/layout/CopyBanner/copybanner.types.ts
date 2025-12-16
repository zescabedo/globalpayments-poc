import { CtaGroupInterface } from '@/components/ui/CTA/cta.types';

interface CopyBannerFieldsItem extends CtaGroupInterface {
  title: JsonValue;
  tag: JsonValue;
  details: JsonValue;
  legalText: JsonValue;
  eyebrow: JsonValue;
  backgroundImage: ImageObject;
  backgroundMdImage: ImageObject;
  backgroundSmImage: ImageObject;
  mainImage: ImageObject;
  mainMdImage: ImageObject;
  mainSmImage: ImageObject;
  focusXDesktop: JsonValue;
  focusYDesktop: JsonValue;
  focusXTablet: JsonValue;
  focusYTablet: JsonValue;
  focusXMobile: JsonValue;
  focusYMobile: JsonValue;
  trustpilotSnippetCode: { jsonValue: {fields: {TrustpilotCode: {value: string}}} };
  mediaSize?: {
    targetItem: {
      Value: {
        jsonValue: {
          value: string;
        };
      };
    };
  };
}

export interface CopyBannerFields {
  data: {
    item: CopyBannerFieldsItem;
  };
}
