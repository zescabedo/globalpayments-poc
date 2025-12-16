import {
  ComponentParams,
  ComponentRendering,
  Field,
  LinkField,
} from '@sitecore-jss/sitecore-jss-nextjs';

export interface NewsletterProps {
  rendering: ComponentRendering & {
    params: ComponentParams & {
      FieldNames?: string;
    };
    fields: NewsletterFields;
  };
  params: {
    [key: string]: string;
  };
  className?: string;
}

export interface getFieldProp {
  jsonValue: Field<string>;
}

export interface NewsletterItem {
  id: string;
  image?: ImageObject;
  description: JsonValue;
  disclaimer: JsonValue;
  cta: {
    targetItem: {
      ctaType: {
        value: string;
      };
      internalLink: { jsonValue: LinkField };
      ctaLink: { jsonValue: LinkField };
      openInModal: JsonValueBoolean;
      modalTheme: {
        targetItem: {
          value: {
            jsonValue: Field<string>;
          };
        };
      };
    };
  };
}

export interface NewsletterFields {
  data: {
    item: NewsletterItem;
  };
}

export type NewsletterLayoutType = 'default' | 'NewsLetterWithBanner' | 'NewsLetterBlock';

export interface NewsletterLayoutProps {
  props: NewsletterProps;
  data: NewsletterItem;
  layoutType: NewsletterLayoutType;
  className?: string;
  style?: string;
}
