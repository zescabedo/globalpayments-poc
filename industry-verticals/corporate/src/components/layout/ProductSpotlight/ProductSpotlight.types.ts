import { CtaGroupInterface } from '@/components/ui/CTA/cta.types';
import { ComponentParams } from '@sitecore-jss/sitecore-jss-nextjs';

export interface ProductSpotlight {
  params: ComponentParams;
  fields: {
    data: {
      item: ProductItem;
    };
  };
}

export interface ProductItem extends CtaGroupInterface {
  title: JsonValue;
  tag: JsonValue;
  details: JsonValue;
  price: JsonValue;
  priceSubtext: JsonValue;
  priceDetail: JsonValue;
  priceDetailSubtext: JsonValue;
  content: JsonValue;
  mainImage: ImageObject;
  mainMdImage: ImageObject;
  mainSmImage: ImageObject;
  backgroundImage: ImageObject;
  backgroundMdImage: ImageObject;
  backgroundSmImage: ImageObject;
}
