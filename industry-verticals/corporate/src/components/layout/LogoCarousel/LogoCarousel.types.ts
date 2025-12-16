import { ComponentParams } from '@sitecore-jss/sitecore-jss-nextjs';

export interface ImageItem {
  id?: string;
  Image: BackgroundImage;
}

export interface CarouselFields {
  data: {
    item: {
      children: {
        results: ImageItem[];
      };
    };
  };
}

export interface CarouselProps {
  fields: CarouselFields;
  params: ComponentParams;
}
