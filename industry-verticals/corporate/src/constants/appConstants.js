export const YOUTUBE_VIDEO_ID_REGEX =
  /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([\w-]{11})/;
 
export const DEFAULT_SITECORE_DATE = '0001-01-01T00:00:00Z';
 
export const PillLinkTableConstants = {
  defaultTitleTag: '2',
};
 
export const L3HeroConstants = {
  defaultTitleTag: '1',
  defaultBackgroundColour: 'base',
  defaultClassName: 'horizontal-colour-block',
  defaultImageType: 'unified-vertical',
};
 
export const CaseStudyHeroConstant = {
  defaultTitleHeadingLevel: '1',
};
export const PromoHiLoCardConstant = {
  defaultTitleHeadingLevel: '4',
};
export const L2HeroConstants = {
  defaultTitleHeadingLevel: 1
};
 
export const L1HeroConstants = {
  defaultTitleTag: 1
};
 
export const BREAKPOINTS = {
  sm: 391,
  md: 769,
  lg: 1366,
};
export const AccordionConstants = {
  defaultTitleHeadingLevel: 2,
  defaultDebounceTime: 250
};
 
export const ProductSpotlightConstants = {
  defaultTitleHeadingLevel: '2',
};
 
export const FeaturedHeroConstants = {
  defaultTitleHeadingLevel: '1',
};
 
export const FooterConstants = {
  defaultFooterNumberOfItemsInFirstColumn: 6,
  defaultFooterBackgroundColorVariant: 'white',
  defaultRegionSelectorModalTheme: 'bg-dark',
};
 
export const copyBannerConstants = {
  defaulttitleHeadingLevel: 2
};
 
export const caseStudyConstants = {
  defaultTitleHeadingLevel: 1
};
 
export const headerConstants = {
  headerDebounceTime: 10,
  defaultHeaderCtaModalTheme: 'bg-white',
};
 
export const LogoCarouselConstants = {
  AUTOPLAY_SPEED: 3000,
  SPEED: 1500,
  SLIDES_TO_SCROLL: 1,
  VARIANTS: {
    SMALL_4X: 'small-4x',
    SMALL_6X: 'small-6x',
    XTRA_SMALL_8X: 'xtrasmall-8x',
    OFFSET_OUTER_10_1: 'offset-outer-10-1',
  },
};
 
export const mediaBannerConstants = {
  defaultBackgroundColour: 'white',
  defaulttitleHeadingLevel: 4
};
 
export const mediaBannerStepsConstants = {
  defaultBackgroundColour: 'white',
  defaulttitleHeadingLevel: '4',
  defaultImageVariant: 'circle',
};
export const quotecopycardConstants = {
  defaulttitleHeadingLevel: '4',
};
 
export const formBannerConstants = {
  defaultTitleHeadingLevel: 3,
};
 
export const BlogCardCarouselConstants = {
  defaultTitleHeadingLevel: 2,
};
 
export const caseStudyCarouselConstants = {
  defaultHeadingSize: 2,
  sliderTopSlidesToShowLg: 3,
  sliderTopSlidesToShowMd: 1.75,
  sliderTopSlidesToShowSm: 1,
  sliderBottomSlidesToShow: 1,
  slidesToScroll: 1,
};
 
export const featureVerticalVideoConstant = {
  defaultTitleHeadingLevel: 3,
  defaultSubtitleHeadingLevel: 4,
};
 
export const formInPageConstants = {
  defaultTitleHeadingLevel: 3
};
 
export const TableOfferMatrixConstants = {
  defaulttitleHeadingLevel: 2
};
 
export const ImageInsetTestimonialConstants = {
  defaultDebounceTime: 50,
};
 
export const contentLogoGridConstants = {
  defaultTitleHeadingLevel: 2
};
 
export const ImageParallaxTextBlockConstants = {
  defaultCardBackgroundColor: 'bg-base',
  defaultTitleHeadingLevel: 4
};
export const GeolocationConstants = {
  cookieMaxAge: 7 * 24 * 60 * 60 * 1000,
  languageCookieMaxAge: 365 * 24 * 60 * 60, // 1 year in seconds (31,536,000)
  showRegionSelectorModalCookieName: 'showRegionSelectorModal',
  languageCookieName: 'GPN.Language',
  defaultRegionSelectorModalTheme: 'bg-dark',
  geoRedirectCookieName: '_geo_redirect_processed',
};
 
export const CustomFieldsForForms = {
  rawHTMLFieldId: '{F6ABF2D4-D864-48D7-A464-75025A42162E}',
  hiddenFieldId: '{B67C70C1-6776-4BCB-8529-AA28E02F6412}',
  hiddenFieldPardotId: '{73D3DA28-A24B-425C-935C-C23592CEC430}',
  dynamicFieldId: '{CE92AE37-5C4C-4DA4-B691-7BD99EA3968B}',
  utmFieldId: '{2E0FC634-B8FE-4D8A-9BED-6C86B00C7916}',
  numberAdvanceId: '{C586212B-B37E-4BA7-957F-6715C23C4CFF}',
};
 
export const SECURITY_SETTINGS = {
  CACHE_EXPIRATION: 5 * 60 * 1000, // 5 minutes in milliseconds
};
export const IpHeader = 'x-forwarded-for';
export const SiteTemplateId = 'E46F3AF239FA4866A1577017C4B2A40C';
export const CountryToLanguageMappingTemplate = 'E1E5D16F-A23E-4405-9A66-AF65985C434C';
 
export const DividerConstants = {
  defaultVariant: 'CentreRightLeftCurveGlow',
};
 
export const IconCardConstants = {
  DefaultHeadigLevel: 3,
};
 
export const TabsConstant = {
  tabDefaultHeadingLevel: 2
};
 
export const MediaBannerIconListConstant = {
  tabDefaultHeadingLevel: 2
};
 
export const PromoCardConstants = {
  defaultTitleHeadingLevel: 3
};
 
export const SelectorBundleCardsConstants = {
  defaultTitleHeadingLevel: 2
};
 
export const SSRPageConstants = {
  RevalidationDuration: 3600,
  languageCodeRegex: /^([a-z]{2})-([a-z]{2})$/i,
};
export const OriginCookieName = 'GPN.Origin';
 
export const LocaleMiddlewareConstants = {
  redirectionStatusCookieName: '_locale_redirect_processed',
};
 
export const analyticsConstants = {
  LaunchLeadGenModal: '6F5FD3D7-B32E-40C6-9259-30CBA321173F',
  WatchVideo: 'EDF8E3E0-5D4D-4196-B365-0207CA7673E8',
  ToggleThroughContent: '04D32633-9848-4CBC-86AA-96701ED6A4E2',
  ClickAudienceSelector: '77683C6C-2553-4FB3-A7DC-0B19AF448241',
};
 
export const ScriptPlaceholderConstants = {
  placeholderConfigs: [
    { name: 'gpn-headless-head', target: 'head' },
    { name: 'gpn-headless-body-top', target: 'body' },
    // Add more placeholders as needed
  ],
 
  // Define where each target should inject scripts
  targetInjectionRules: {
    head: 'document.head',
    body: 'before-__next',
    // Add more injection rules as needed
  },
};
 
export const ModalConstants = {
  defaultModalWidth: '1280',
  defaultModalHeight: '960',
};
 
export const imageBlockConstants = {
  DEFAULT_DISPLAY_TYPE: 'ImageLeftTextRight',
  DEFAULT_MOBILE_DISPLAY_TYPE: 'Image First',
};
 
export const uptickArticleDetail = {
  uptickArticleId: 'uptick-article-content',
};
 
export const FormAPI = {
  postUIErrorAPIPath: '/api/proxy/forms/postuierrors',
};
 
export const SearchTagResultsConstant = {
  DEFAULT_LANGUAGE: 'en-US',
  DEFAULT_PAGESIZE: 15,
  AUDIENCE_TEMPLATE_ID: '4976eee4-9ec3-4ee0-9add-78a700b65591',
  FILTER_KEY_TO_QUERY_NAME: {
    contentTypes: 'contentType',
    products: 'products',
    topics: 'topics',
  },
  EMPTY_FILTER_STATE: { contentTypes: new Map(), products: new Map(), topics: new Map() },
};
 
export const ReturnUrlCookieName = 'uptick_return';
 
export const PreviousUrlCookieName = 'uptick_previous_return';
 
export const focusedCardConstant = {
  EXPANDED_WIDTH: 424,
  EXPANDED_HEIGHT: 589,
  NORMAL_WIDTH: 200,
  NORMAL_HEIGHT: 278,
  GAP: 24,
  CARD_OFFSET: 224,
  EXPANDED_CONTENT_WIDTH: 407,
  EXPANDED_CONTENT_HEIGHT: 120,
  EXPANDED_CONTENT_FONT: '32px',
  CONTENT_WIDTH: 184,
  CONTENT_HEIGHT: 88,
  CONTENT_FONT: '20px',
  THRESHOLD: 100,
  DURATION: 0.3,
};
 
export const urlPatterns = {
  localePrefix: /^\/[a-zA-Z]{2}(-[a-zA-Z]{2,})?\//,
  wildcardPlaceholder: ',-w-,',
  basePathMatcher: /\/([^/]+)\/,-w-,/,
};
 
export const uptickTableOfContents = {
  TOC_STICKY_HEADER_HEIGHT: 80,
  TOC_VISIBLE_THRESHOLD: 10,
  TOC_BOTTOM_THRESHOLD: 120,
};
 
export const UPTICK_APIS = {
  content: '/api/uptick/content/',
};

export const DictionaryConstants = {
  forms: {
    formError500: 'form-error-500',
    formError400: 'form-error-400',
    formErrorGeneric: 'form-error-generic',
  },
};
 
export const uptickConstants = {
  authorTemplateId: 'D3BC4A1033D04B85A1705D61FBD5F44D',
  industryTemplateId: '4976EEE49EC34EE09ADD78A700B65591',
  uptickContentRootId: '38CDA13EB4194B7EBC47AC3923F4EEFC',
  uptickAuthorTemplateId: 'D3BC4A1033D04B85A1705D61FBD5F44D',
  uptickContentTemplateId: '01F9C0391F774CE3A46ADE4CB733ED3F',
  uptickIndustryTemplateId: '4976EEE49EC34EE09ADD78A700B65591',
};

export const sitemapConstants = {
  jssSettingTemplateId: '7468b2faa6974ca38a171e9753cf8092',
  uptickSiteConfigurationTemplateId: '{B5702A2B-9D22-4670-81C1-23393420AABB}',
  basePageTemplateId: '4715171126ca434e8132d3e0b7d26683',
  sitemapNavigationId: 'a0e7ff5769944b09aa21104239628d5a',
}