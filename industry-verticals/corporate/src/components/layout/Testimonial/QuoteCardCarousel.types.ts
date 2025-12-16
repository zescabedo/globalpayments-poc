import { ComponentParams, RichTextField } from '@sitecore-jss/sitecore-jss-nextjs';

export interface CardDataProp {
  quote: { jsonValue: RichTextField };
  quoteAuthor: { jsonValue: RichTextField };
  quoteAuthorTag?: { jsonValue: RichTextField };
  quoteLogo?: BackgroundImage;
}
interface Fields {
  data: {
    item: {
      children: {
        results: CardDataProp[];
      };
    };
  };
}

export interface QuoteCardDataProps {
  params: {
    [key: string]: string;
  };
  fields: Fields;
}

export interface QuoteCardCarouselProp {
  theme?: string;
  cardVal: CardDataProp[];
  quoteMarkColor?: string;
  params: ComponentParams;
}
