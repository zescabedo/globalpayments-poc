import {
  ComponentRendering,
  ComponentParams,
  RichTextField,
} from '@sitecore-jss/sitecore-jss-nextjs';

interface Fields {
  data: {
    item: {
      id: string;
      quote: { jsonValue: RichTextField };
      quoteAuthor: { jsonValue: RichTextField };
      quoteAuthorTag: { jsonValue: RichTextField };
      textBackgroundColor: {
        jsonValue: {
          id: string;
          url: string;
          name: string;
          displayName: string;
          fields: {
            Value: {
              value: string;
            };
          };
        };
      };
      focusXDesktop: JsonValue;
      focusYDesktop: JsonValue;
      focusXTablet: JsonValue;
      focusYTablet: JsonValue;
      focusXMobile: JsonValue;
      focusYMobile: JsonValue;
      logo: ImageObject;
      backgroundImage: ImageObject;
      backgroundSmImage: ImageObject;
      backgroundMdImage: ImageObject;
    };
  };
}

export interface ImageInsetTestimonialProps {
  rendering: ComponentRendering & { params: ComponentParams };
  params: ComponentParams;
  fields: Fields;
}
