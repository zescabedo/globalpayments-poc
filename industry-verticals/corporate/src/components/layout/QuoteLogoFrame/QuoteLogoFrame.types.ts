import {
  ComponentParams,
  ComponentRendering,
  RichTextField,
} from '@sitecore-jss/sitecore-jss-nextjs';

export interface QuoteLogoFrameCardProps {
  rendering: ComponentRendering & { params: ComponentParams };
  params: ComponentParams;
  fields: Fields;
}

export type Fields = {
  data: {
    item: {
      quote: { jsonValue: RichTextField };
      quoteAuthor: { jsonValue: RichTextField };
      quoteAuthorTag: { jsonValue: RichTextField };
      quoteLogo: ImageObject;
    };
  };
};
