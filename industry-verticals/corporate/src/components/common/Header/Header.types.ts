import {
  ComponentParams,
  ComponentRendering,
  LinkField,
  RichTextField,
} from '@sitecore-jss/sitecore-jss-nextjs';
import { CtaGroupInterface } from '@/components/ui/CTA/cta.types';

export interface MenuObject {
  name: string;
  menuTitle: JsonValue;
  menuSummary: JsonValue;
  menuLink: { jsonValue: LinkField };
  children: { results: MenuObject[] };
}

export interface QuickLinkObject {
  text: JsonValue;
  url: {
    jsonValue: LinkField;
  };
}

interface UtilityObject {
  link: {
    jsonValue: LinkField;
  };
}

export interface Language {
  languageTag: string;
  languageName: string;
  languageIcon: { url: string };
  languageUrl: string;
}
interface AlertBannerTargetItem extends CtaGroupInterface {
  id: string;
  leftAlertImage: ImageObject;
  rightAlertImage: ImageObject;
  mobileAlertImage: ImageObject;
  isSecondaryVariant: JsonValueBoolean;
  timeToResetBanner: JsonValue;
  alertText: JsonValue;
  bannerStartDateTime: JsonValue;
  bannerEndDateTime: JsonValue;
  backgroundTheme: {
    targetItem: {
      value: JsonValue;
    };
  };
}

interface Fields {
  data: {
    item: {
      homePageLink: {
        jsonValue: LinkField;
      };
      landingPageContactNumber: { jsonValue: RichTextField };
      landingPageImage: ImageObject;
      alertBanner: {
        targetItem: AlertBannerTargetItem;
      };
      isBannerEnabled: JsonValueBoolean;
      showPrimaryCTA: JsonValueBoolean;
      showSearchFunctionality: JsonValueBoolean;
      showUtilityNav: JsonValueBoolean;
      normalLogo: ImageObject;
      stickyLogo: ImageObject;
      mobileLogo: ImageObject;
      mobileStickyLogo: ImageObject;
      languageSwitcherType: {
        jsonValue: {
          fields: { Value: { value: string } };
        };
      };
      logoPlacement: {
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
      mainMenu: {
        targetItem: {
          children: {
            results: MenuObject[];
          };
          Value: null;
        };
      };
      mobileMenu: {
        targetItem: {
          children: {
            results: MenuObject[];
          };
          Value: null;
        };
      };
      utilityLinks: {
        targetItem: {
          children: {
            results: UtilityObject[];
          };
        };
      };
      showLanguageSwitcher: JsonValueBoolean;
      secondaryMenu: {
        targetItem: {
          children: {
            results: UtilityObject[];
          };
        };
      };
      cta: {
        jsonValue: LinkField;
      };
      openHeaderCtaInModal: JsonValueBoolean;
      headerCtaModalTheme: {
        targetItem: {
          value: JsonValue;
        };
      };
      href: null;
      searchBoxDatasource: {
        jsonValue: {
          id: string;
          url: string;
          name: string;
          displayName: string;
          fields: {
            Title: {
              value: string;
            };
          };
        };
      };
      title: null;
      navigationTitle: null;
      quickLinks: {
        targetItem: TargetItemWithChildren<QuickLinkObject>;
      };
      popularSearches: {
        targetItem: TargetItemWithChildren<QuickLinkObject>;
      };
      searchPageUrl: { jsonValue: LinkField };
    };
  };
}

export interface HeaderProps {
  rendering: ComponentRendering & { params: ComponentParams };
  params: ComponentParams;
  fields: Fields;
}

export interface QuickLinkListProps {
  title?: RichTextField;
  items: QuickLinkObject[];
}

interface TargetItemWithChildren<T> {
  title: { jsonValue: RichTextField };
  children: {
    results: T[];
  };
}
