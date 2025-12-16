import { CtaGroupInterface } from '@/components/ui/CTA/cta.types';
import { RichTextField } from '@sitecore-jss/sitecore-jss-nextjs';

interface ItemProps extends CtaGroupInterface {
  title: { jsonValue: RichTextField };
  mainImage: ImageObject;
  mainMdImage: ImageObject;
  mainSmImage: ImageObject;
  logo: ImageObject;
  details?: { jsonValue: RichTextField };
}

interface Fields {
  data: {
    item: ItemProps;
  };
}
export interface CaseStudyHeroProps {
  params: {
    [key: string]: string;
  };
  fields: Fields;
}
