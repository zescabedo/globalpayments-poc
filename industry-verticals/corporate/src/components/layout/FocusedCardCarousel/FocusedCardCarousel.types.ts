import { ComponentParams, ComponentRendering, ImageField } from '@sitecore-jss/sitecore-jss-nextjs';
import { CustomArrowProps } from 'react-slick';

export interface FocusedCardCarouselProps {
  rendering: ComponentRendering & { params: ComponentParams };
  params: ComponentParams;
  fields: Fields;
}
export type Fields = {
  data: {
    focusedCardCarousel: FocusedCardCarouselType;
    featuredCards: FeaturedCardsType;
  };
};

export interface CustomArrowWithDisabledProps extends CustomArrowProps {
  disabled?: boolean;
}

type FocusedCardCarouselType = {
  title: JsonValue;
  learnMore: JsonValue;
  exploreContent: JsonValue;
};

type FeaturedCardsType = {
  results: {
    promoSummary: JsonValue;
    promoIcon: { jsonValue: { url: string; name: string } };
    promoImage: { jsonValue: ImageField };
    promoTitle: JsonValue;
    title: JsonValue;
    url: { path: string };
    slug: JsonValue;
  }[];
};
