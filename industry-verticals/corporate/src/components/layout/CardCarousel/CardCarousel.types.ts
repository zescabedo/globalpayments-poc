import { ComponentParams, ComponentRendering } from '@sitecore-jss/sitecore-jss-nextjs';
import { CustomArrowProps } from 'react-slick';

export interface CardCarouselProps {
  rendering: ComponentRendering & { params: ComponentParams };
  params: ComponentParams;
  fields: Fields;
}
export type Fields = {
  data: {
    item: {
      id: string;
      title: JsonValue;
      CardCarousel: {
        targetItems: CarouselCardsType[];
      };
    };
  };
};
export type CarouselCardsType = {
  Title: JsonValue;
  Image: ImageObject;
  Icon: {
    jsonValue:{
      url: string;
    }
  };
  id: string;
  slug: JsonValue;
  name : string;
};
export interface CustomArrowWithDisabledProps extends CustomArrowProps {
  disabled?: boolean;
}
export interface CardCarouselParams extends ComponentParams {
  SlideToShow: string;
}
