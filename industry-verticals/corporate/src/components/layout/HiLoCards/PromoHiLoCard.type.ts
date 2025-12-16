import { CtaGroupInterface } from '@/components/ui/CTA/cta.types';
import { RichTextField } from '@sitecore-jss/sitecore-jss-nextjs';

export interface CardItem extends CtaGroupInterface {
  bodyCopy: { jsonValue: RichTextField };
  tag: { jsonValue: RichTextField };
  mainTitle: { jsonValue: RichTextField };
  mainImage: ImageObject;
  mainMdImage: ImageObject;
  mainSmImage: ImageObject;
  id: string;
}

interface DataItem {
  header: { jsonValue: RichTextField };
  children: {
    results: CardItem[];
  };
}
export interface PromoHiLoDataprop {
  fields: {
    data: {
      item: DataItem;
    };
  };
  params: {
    headingSize?: string;
    FieldNames?: string;
    heroBackground?: string;
    backgroundColorVariant?: string;
    DynamicPlaceholderId?: string;
    Styles?: string;
    ImageTreatment?: string;
  };
}
