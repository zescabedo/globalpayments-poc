import {
  ComponentParams,
  ComponentRendering,
  LinkField,
  RichTextField,
} from '@sitecore-jss/sitecore-jss-nextjs';

interface SocialIconItem {
  image: ImageObject;
  url: { jsonValue: LinkField };
  caption: { jsonValue: RichTextField };
}

export interface FooterLinkItem {
  footerLink: {
    jsonValue: LinkField;
  };
}

interface Fields {
  data: {
    item: {
      subscribeCtaTitle: { jsonValue: RichTextField };
      subscribeCtaText: { jsonValue: RichTextField };
      subscribeCtaLink: { jsonValue: LinkField };
      showSubscribeCta: JsonValueBoolean;
      showRegionSelector: JsonValueBoolean;
      regionSelectorTitle: { jsonValue: RichTextField };
      regionSelectorModal: { jsonValue: LinkField };
      showRegionSelectorInModal: JsonValueBoolean;
      languageName: { jsonValue: RichTextField };
      trustpilotSnippetCode: { jsonValue: {fields: {TrustpilotCode: {value: string}}} };
      socialIcons: { targetItems: SocialIconItem[] };
      socialIconsTitle: { jsonValue: RichTextField };
      leftColumnTitle: { jsonValue: RichTextField };
      leftColumnDetails: { jsonValue: RichTextField };
      middleColumnTitle: { jsonValue: RichTextField };
      middleColumnDetails: { jsonValue: RichTextField };
      rightColumnTitle: { jsonValue: RichTextField };
      rightColumnDetails: { jsonValue: RichTextField };
      disclaimer: { jsonValue: RichTextField };
      copyright: { jsonValue: RichTextField };
      links: { jsonValue: RichTextField };
      logo: ImageObject;
      footerLinks: { targetItems: FooterLinkItem[] };
      footerNumberOfItemsInFirstColumn: JsonValueNumber;
      actionCtaText: { jsonValue: RichTextField };
      actionCtaLink: { jsonValue: LinkField };
      showActionCta: JsonValueBoolean;
      showFooterLinks: JsonValueBoolean;
      actionCtaTitle: { jsonValue: RichTextField };
      regionSelectorModalTheme: {
        targetItem: {
          value: JsonValue;
        };
      };
    };
  };
}

export interface FooterProps {
  rendering: ComponentRendering & {
    fields: Fields;
    params: ComponentParams;
  };
  params: ComponentParams;
  fields: Fields;
}
