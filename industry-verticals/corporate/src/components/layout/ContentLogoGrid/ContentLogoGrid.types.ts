import { CtaGroupInterface } from '@/components/ui/CTA/cta.types';
import {
  ComponentParams,
  ComponentRendering,
  LinkField,
  RichTextField,
} from '@sitecore-jss/sitecore-jss-nextjs';

interface LogoObject {
  id: string;
  url: {
    jsonValue: LinkField;
  };
  image: ImageObject;
  caption: JsonValue;
}

interface ContentLogoGridItem extends CtaGroupInterface {
  details: { jsonValue: RichTextField };
  tag: { jsonValue: RichTextField };
  title: { jsonValue: RichTextField };
  logos: {
    results: LogoObject[];
  };
}

interface Fields {
  data: {
    item: ContentLogoGridItem;
  };
}

export interface ContentLogoGridProps {
  rendering: ComponentRendering & { params: ComponentParams };
  params: ComponentParams;
  fields: Fields;
  className?: string;
}
