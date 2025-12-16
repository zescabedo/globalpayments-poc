import { CtaGroupInterface } from '@/components/ui/CTA/cta.types';
import { RichTextField } from '@sitecore-jss/sitecore-jss-nextjs';

interface FeatureDataProp extends CtaGroupInterface {
  brow: { jsonValue: RichTextField };
  title: { jsonValue: RichTextField };
  tag: { jsonValue: RichTextField };
  details: { jsonValue: RichTextField };
  chartTitle: { jsonValue: RichTextField };
  chartTag: { jsonValue: RichTextField };
  chartFootnote: { jsonValue: RichTextField };
  chartRTE: { jsonValue: RichTextField };
}
interface Fields {
  data: {
    item: FeatureDataProp;
  };
}
export interface FeatureContentDataProps {
  params: {
    [key: string]: string;
  };
  fields: Fields;
}
