//Global type definition
declare module 'gsap/dist/gsap' {
  export * from 'gsap';
}

declare module 'gsap/dist/MotionPathPlugin' {
  export * from 'gsap/MotionPathPlugin';
}
type JsonValue = {
  jsonValue: {
    value: string;
  };
};

interface Window {
  tarsSettings: {
    convid: string;
    url_params: string;
  };
  FormsBase?: {
    initializeForm: (form: Element) => void;
  };
  Common?: {
    setCookie: (name: string, value: string, days: number) => void;
  };
  Trustpilot?: TrustpilotAPI;
  __dataLayerPushedPaths: string;
  dataLayer: DataLayerEvent[];
}

interface ValueField {
  value: string;
}

type ImageItem = {
  src: string;
  height: string;
  width: string;
  alt: string;
};

type CTAField = {
  jsonValue: LinkField;
};

interface VideoObject {
  id: string;
  href: string;
  text: string;
  linktype: string;
  url: string;
  anchor: string;
  target: string;
}

interface ImageObject {
  jsonValue: ImageField;
  src: string;
  alt: string;
  height: string;
  width: string;
}

type VideoFields = {
  jsonValue: {
    value: {
      href: string;
    };
  };
};

interface ImageObject {
  jsonValue: ImageField;
  src: string;
  alt: string;
  height: number;
  width: number;
}

type BackgroundImage = {
  jsonValue: ImageField;
  src: string;
  alt: string;
  height: string;
  width: string;
};

interface ImageObject {
  jsonValue: ImageField;
  src: string;
  alt: string;
  height: number;
  width: number;
}

interface JsonValueBoolean {
  jsonValue: {
    value: boolean;
  };
}

interface CTALink {
  jsonValue: LinkField;
}
interface CTAOverrideActionStyle {
  targetItem: {
    value: JsonValue;
  };
}
interface JsonValueNumber {
  jsonValue: {
    value: number;
  };
}

interface CTAOverrindingStyle {
  targetItem: {
    value: JsonValue;
  };
}

interface CTALink {
  jsonValue: LinkField;
}

interface CTAItem {
  id: string;
  ctaTitle: JsonValue;
  ctaLink: { jsonValue: LinkField };
  overrideActionStyle: {
    targetItem: {
      value: JsonValue;
    };
  };
}

interface DataLayer {
  DataLayer: {
    user: object;
    page: object;
  };
}

interface TrustpilotAPI {
  loadFromElement: (elements: Element | null) => void;
}

interface DataLayerEvent {
  event: string;
  search?: {
    term: string;
    type: string;
  };
  form?: {
    id: string;
    name: string;
    click_cta?: string;
  };
  [key: string]: string | number | boolean | undefined | object;
}

interface ExtendedSiteInfo extends SiteInfo {
  targetHostName?: string;
  virtualFolder?: string;
  [key: string]: any;
}