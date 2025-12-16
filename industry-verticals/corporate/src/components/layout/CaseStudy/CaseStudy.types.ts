import { CtaGroupInterface } from '@/components/ui/CTA/cta.types';
import { LinkField } from '@sitecore-jss/sitecore-jss-nextjs';

export interface CaseStudyProps {
  params: {
    imageVariant: string;
    foreGroundColorVariant: string;
    titleFontSize: string;
    tagFontSize: string;
    animations: string;
    backgroundColorVariant: string;
  };

  fields: {
    data: {
      item: CaseStudyItem;
    };
  };

  className: string;
}

interface CaseStudyItem extends CtaGroupInterface {
  logo: BackgroundImage;
  backgroundImage: BackgroundImage;
  title: JsonValue;
  quoteCompany: JsonValue;
  quoteName: JsonValue;
  tag: JsonValue;
  ctaTitle?: JsonValue;
  ctaLink?: { jsonValue: LinkField };
  overrideActionStyle?: {
    targetItem: {
      value: JsonValue;
    };
  };
  mainImage: BackgroundImage;
  mainMdImage: BackgroundImage;
  mainSmImage: BackgroundImage;
  focusXDesktop: JsonValue;
  focusYDesktop: JsonValue;
  focusXTablet: JsonValue;
  focusYTablet: JsonValue;
  focusXMobile: JsonValue;
  focusYMobile: JsonValue;
}
