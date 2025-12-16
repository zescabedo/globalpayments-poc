// Below are built-in components that are available in the app, it's recommended to keep them as is

import { BYOCWrapper, NextjsContentSdkComponent, FEaaSWrapper } from '@sitecore-content-sdk/nextjs';
import { Form } from '@sitecore-content-sdk/nextjs';

// end of built-in components
import * as Title from 'src/components/Title';
import * as Tabs from 'src/components/Tabs';
import * as RowSplitter from 'src/components/RowSplitter';
import * as RichText from 'src/components/RichText';
import * as PromoCards from 'src/components/PromoCards';
import * as Promo from 'src/components/Promo';
import * as ProductCards from 'src/components/ProductCards';
import * as PartialDesignDynamicPlaceholder from 'src/components/PartialDesignDynamicPlaceholder';
import * as PageContent from 'src/components/PageContent';
import * as Navigation from 'src/components/Navigation';
import * as MediaBannerIconList from 'src/components/MediaBannerIconList';
import * as LinkList from 'src/components/LinkList';
import * as Image from 'src/components/Image';
import * as IconCards from 'src/components/IconCards';
import * as FontSizeSelector from 'src/components/FontSizeSelector';
import * as ContentCards from 'src/components/ContentCards';
import * as ContentBlock from 'src/components/ContentBlock';
import * as Container from 'src/components/Container';
import * as ColumnSplitter from 'src/components/ColumnSplitter';
import * as Videotypes from 'src/components/ui/Video/Video.types';
import * as GPVideo from 'src/components/ui/Video/GPVideo';
import * as RegionSelectorModal from 'src/components/ui/Modal/RegionSelectorModal';
import * as OverlayLinkHandler from 'src/components/ui/Modal/OverlayLinkHandler';
import * as ModalProvider from 'src/components/ui/Modal/ModalProvider';
import * as Modal from 'src/components/ui/Modal/Modal';
import * as LottieAnimationtypes from 'src/components/ui/LottieAnimation/LottieAnimation.types';
import * as LottieAnimation from 'src/components/ui/LottieAnimation/LottieAnimation';
import * as Link from 'src/components/ui/Link/Link';
import * as ImageItem from 'src/components/ui/Image/ImageItem';
import * as Imagetypes from 'src/components/ui/Image/Image.types';
import * as GPImage from 'src/components/ui/Image/GPImage';
import * as Heading from 'src/components/ui/Heading/Heading';
import * as GPMediatypes from 'src/components/ui/GPMedia/GPMedia.types';
import * as GPMedia from 'src/components/ui/GPMedia/GPMedia';
import * as ctatypes from 'src/components/ui/CTA/cta.types';
import * as CTA from 'src/components/ui/CTA/CTA';
import * as Button from 'src/components/ui/Button/Button';
import * as Brow from 'src/components/ui/Brow/Brow';
import * as AOS from 'src/components/ui/AOS/AOS';
import * as TrustPilotRefresher from 'src/components/meta/TrustPilotRefresher';
import * as HeadlessHTMLSnippet from 'src/components/meta/HeadlessHTMLSnippet';
import * as QuoteImagetypes from 'src/components/layout/Testimonials/QuoteImage/QuoteImage.types';
import * as QuoteImage from 'src/components/layout/Testimonials/QuoteImage/QuoteImage';
import * as QuoteCardCarouselWrapper from 'src/components/layout/Testimonial/QuoteCardCarouselWrapper';
import * as QuoteCardCarouseltypes from 'src/components/layout/Testimonial/QuoteCardCarousel.types';
import * as QuoteCardCarousel from 'src/components/layout/Testimonial/QuoteCardCarousel';
import * as TabsComponenttypes from 'src/components/layout/TabsComponent/TabsComponent.types';
import * as TabsComponent from 'src/components/layout/TabsComponent/TabsComponent';
import * as TableOfferMatrixtypes from 'src/components/layout/Table Offer Matrix/TableOfferMatrix.types';
import * as TableOfferMatrix from 'src/components/layout/Table Offer Matrix/TableOfferMatrix';
import * as TabNavVerticaltypes from 'src/components/layout/TabNavVertical/TabNavVertical.types';
import * as TabNavVertical from 'src/components/layout/TabNavVertical/TabNavVertical';
import * as SelectorBundleCardstypes from 'src/components/layout/SelectorBundleCards/SelectorBundleCards.types';
import * as SelectorBundleCards from 'src/components/layout/SelectorBundleCards/SelectorBundleCards';
import * as SearchTagResultstype from 'src/components/layout/SearchTagResults/SearchTagResults.type';
import * as SearchTagResults from 'src/components/layout/SearchTagResults/SearchTagResults';
import * as Results from 'src/components/layout/SearchTagResults/Results';
import * as Pagination from 'src/components/layout/SearchTagResults/Pagination';
import * as Filters from 'src/components/layout/SearchTagResults/Filters';
import * as QuoteLogoFrametypes from 'src/components/layout/QuoteLogoFrame/QuoteLogoFrame.types';
import * as QuoteLogoFrame from 'src/components/layout/QuoteLogoFrame/QuoteLogoFrame';
import * as QuoteCopyCardtypes from 'src/components/layout/QuoteCopyCard/QuoteCopyCard.types';
import * as QuoteCopyCard from 'src/components/layout/QuoteCopyCard/QuoteCopyCard';
import * as PromoCardtypes from 'src/components/layout/PromoCard/PromoCard.types';
import * as PromoCard from 'src/components/layout/PromoCard/PromoCard';
import * as ProductSpotlighttypes from 'src/components/layout/ProductSpotlight/ProductSpotlight.types';
import * as ProductSpotlight from 'src/components/layout/ProductSpotlight/ProductSpotlight';
import * as ProductCardtypes from 'src/components/layout/ProductCard/ProductCard.types';
import * as ProductCard from 'src/components/layout/ProductCard/ProductCard';
import * as PlanSelectorCardText from 'src/components/layout/PlanSelectorCard/PlanSelectorCardText';
import * as PlanSelectorCardtypes from 'src/components/layout/PlanSelectorCard/PlanSelectorCard.types';
import * as PlanSelectorCard from 'src/components/layout/PlanSelectorCard/PlanSelectorCard';
import * as PillLinkTabletypes from 'src/components/layout/PillLinkTable/PillLinkTable.types';
import * as PillLinkTable from 'src/components/layout/PillLinkTable/PillLinkTable';
import * as PageTemplatestypes from 'src/components/layout/PageTemplates/PageTemplates.types';
import * as PageTemplates from 'src/components/layout/PageTemplates/PageTemplates';
import * as MediaBannerStepstypes from 'src/components/layout/Mediabannersteps/MediaBannerSteps.types';
import * as MediaBannerSteps from 'src/components/layout/Mediabannersteps/MediaBannerSteps';
import * as MediaBannerIcontypes from 'src/components/layout/MediaBannerIcon/MediaBannerIcon.types';
import * as MediaBannerIcon from 'src/components/layout/MediaBannerIcon/MediaBannerIcon';
import * as MediaBannertypes from 'src/components/layout/MediaBanner/MediaBanner.types';
import * as MediaBanner from 'src/components/layout/MediaBanner/MediaBanner';
import * as LogoCarouseltypes from 'src/components/layout/LogoCarousel/LogoCarousel.types';
import * as LogoCarousel from 'src/components/layout/LogoCarousel/LogoCarousel';
import * as ContentListtypes from 'src/components/layout/List/ContentList.types';
import * as ContentList from 'src/components/layout/List/ContentList';
import * as L2Herotypes from 'src/components/layout/L2Hero/L2Hero.types';
import * as L2Hero from 'src/components/layout/L2Hero/L2Hero';
import * as ImageParallaxTextBlocktypes from 'src/components/layout/ImageParallaxTextBlock/ImageParallaxTextBlock.types';
import * as ImageParallaxTextBlock from 'src/components/layout/ImageParallaxTextBlock/ImageParallaxTextBlock';
import * as ImageInsetTestimonialtypes from 'src/components/layout/ImageInsetTestimonial/ImageInsetTestimonial.types';
import * as ImageInsetTestimonial from 'src/components/layout/ImageInsetTestimonial/ImageInsetTestimonial';
import * as IconCardListtypes from 'src/components/layout/IconCardList/IconCardList.types';
import * as IconCardList from 'src/components/layout/IconCardList/IconCardList';
import * as PromoHiLoCardtype from 'src/components/layout/HiLoCards/PromoHiLoCard.type';
import * as PromoHiLoCard from 'src/components/layout/HiLoCards/PromoHiLoCard';
import * as HiLoCards from 'src/components/layout/HiLoCards/HiLoCards';
import * as L4Hero from 'src/components/layout/Hero/L4Hero';
import * as L3Herotypes from 'src/components/layout/Hero/L3Hero.types';
import * as L3Hero from 'src/components/layout/Hero/L3Hero';
import * as L1Hero from 'src/components/layout/Hero/L1Hero';
import * as Herotypes from 'src/components/layout/Hero/Hero.types';
import * as HeadlessForm from 'src/components/layout/HeadlessForm/HeadlessForm';
import * as CustomFieldFactory from 'src/components/layout/HeadlessForm/CustomFieldFactory';
import * as FormInPagetypes from 'src/components/layout/Forms/FormInPage/FormInPage.types';
import * as FormInPage from 'src/components/layout/Forms/FormInPage/FormInPage';
import * as FormBannertypes from 'src/components/layout/Forms/FormBanner/FormBanner.types';
import * as FormBanner from 'src/components/layout/Forms/FormBanner/FormBanner';
import * as FocusedCardCarouseltypes from 'src/components/layout/FocusedCardCarousel/FocusedCardCarousel.types';
import * as FocusedCardCarousel from 'src/components/layout/FocusedCardCarousel/FocusedCardCarousel';
import * as featuredherotypes from 'src/components/layout/FeaturedHero/featuredhero.types';
import * as FeaturedHero from 'src/components/layout/FeaturedHero/FeaturedHero';
import * as FeaturedArticlestypes from 'src/components/layout/FeaturedArticles/FeaturedArticles.types';
import * as FeaturedArticles from 'src/components/layout/FeaturedArticles/FeaturedArticles';
import * as featureVerticalVideotypes from 'src/components/layout/FeatureVerticalVideo/featureVerticalVideo.types';
import * as featureVerticalVideo from 'src/components/layout/FeatureVerticalVideo/featureVerticalVideo';
import * as FeatureContenttypes from 'src/components/layout/FeatureContent/FeatureContent.types';
import * as FeatureContent from 'src/components/layout/FeatureContent/FeatureContent';
import * as RightToLeftCurveGlow from 'src/components/layout/Divider/RightToLeftCurveGlow';
import * as RightToLeftCurve from 'src/components/layout/Divider/RightToLeftCurve';
import * as Dividertypes from 'src/components/layout/Divider/Divider.types';
import * as Divider from 'src/components/layout/Divider/Divider';
import * as CentreRightLeftCurveGlow from 'src/components/layout/Divider/CentreRightLeftCurveGlow';
import * as CenterRightLeftCenterGlow from 'src/components/layout/Divider/CenterRightLeftCenterGlow';
import * as copybannertypes from 'src/components/layout/CopyBanner/copybanner.types';
import * as copybanner from 'src/components/layout/CopyBanner/copybanner';
import * as ContentStatstypes from 'src/components/layout/ContentStats/ContentStats.types';
import * as ContentStats from 'src/components/layout/ContentStats/ContentStats';
import * as ContentLogoGridtypes from 'src/components/layout/ContentLogoGrid/ContentLogoGrid.types';
import * as ContentLogoGrid from 'src/components/layout/ContentLogoGrid/ContentLogoGrid';
import * as ContentCardsText from 'src/components/layout/ContentCards/ContentCardsText';
import * as ContentCardstypes from 'src/components/layout/ContentCards/ContentCards.types';
import * as CaseStudyHerotypes from 'src/components/layout/CaseStudyHero/CaseStudyHero.types';
import * as CaseStudyHero from 'src/components/layout/CaseStudyHero/CaseStudyHero';
import * as CaseStudyCarouseltypes from 'src/components/layout/CaseStudyCarousel/CaseStudyCarousel.types';
import * as CaseStudyCarousel from 'src/components/layout/CaseStudyCarousel/CaseStudyCarousel';
import * as CaseStudytypes from 'src/components/layout/CaseStudy/CaseStudy.types';
import * as CaseStudy from 'src/components/layout/CaseStudy/CaseStudy';
import * as CardCarouseltypes from 'src/components/layout/CardCarousel/CardCarousel.types';
import * as CardCarousel from 'src/components/layout/CardCarousel/CardCarousel';
import * as BlogCardstypes from 'src/components/layout/BlogCards/BlogCards.types';
import * as BlogCards from 'src/components/layout/BlogCards/BlogCards';
import * as BlogCardsCarousel from 'src/components/layout/BlogCardCarousel/BlogCardsCarousel';
import * as BlogCard from 'src/components/layout/BlogCard/BlogCard';
import * as Accordiontypes from 'src/components/layout/Accordion/Accordion.types';
import * as Accordion from 'src/components/layout/Accordion/Accordion';
import * as ProductInterest from 'src/components/common/ProductInterest/ProductInterest';
import * as QuickLinkList from 'src/components/common/Header/QuickLinkList';
import * as Headertypes from 'src/components/common/Header/Header.types';
import * as Header from 'src/components/common/Header/Header';
import * as Footertypes from 'src/components/common/Footer/Footer.types';
import * as Footer from 'src/components/common/Footer/Footer';
import * as VisitorIdentification from 'src/components/analytics/VisitorIdentification';
import * as SitecoreTracking from 'src/components/analytics/SitecoreTracking';
import * as PageViewTracker from 'src/components/analytics/PageViewTracker';
import * as UptickTaxonomytypes from 'src/components/Uptick/UptickTaxonomy.types';
import * as UptickTaxonomy from 'src/components/Uptick/UptickTaxonomy';
import * as UptickHeroWithTexttypes from 'src/components/Uptick/UptickHeroWithText.types';
import * as UptickHeroWithText from 'src/components/Uptick/UptickHeroWithText';
import * as SocialSharing from 'src/components/Uptick/SocialSharing';
import * as SearchResultAuthorCardList from 'src/components/Uptick/SearchResultAuthorCardList';
import * as SMEContentBlock from 'src/components/Uptick/SMEContentBlock';
import * as RelatedContentCardsDefault from 'src/components/Uptick/RelatedContentCardsDefault';
import * as IframeCeros from 'src/components/Uptick/IframeCeros';
import * as FeaturedContent from 'src/components/Uptick/FeaturedContent';
import * as ContentCardCarouselSearch from 'src/components/Uptick/ContentCardCarouselSearch';
import * as ContentCardCarousel from 'src/components/Uptick/ContentCardCarousel';
import * as AuthorCardRenderer from 'src/components/Uptick/AuthorCardRenderer';
import * as AuthorCardListtypes from 'src/components/Uptick/AuthorCardList.types';
import * as AuthorCardList from 'src/components/Uptick/AuthorCardList';
import * as AuthorCardtypes from 'src/components/Uptick/AuthorCard.types';
import * as AuthorCard from 'src/components/Uptick/AuthorCard';
import * as ArticleBannertypes from 'src/components/Uptick/ArticleBanner.types';
import * as ArticleBanner from 'src/components/Uptick/ArticleBanner';
import * as UptickCard from 'src/components/Uptick/ui/UptickCard';
import * as Tags from 'src/components/Uptick/shared/Tags/Tags';
import * as ContentMetatypes from 'src/components/Uptick/shared/ContentMeta/ContentMeta.types';
import * as ContentMeta from 'src/components/Uptick/shared/ContentMeta/ContentMeta';
import * as TaxonomyTagstype from 'src/components/Uptick/TaxonomyTags/TaxonomyTags.type';
import * as TaxonomyTags from 'src/components/Uptick/TaxonomyTags/TaxonomyTags';
import * as Newslettertypes from 'src/components/Uptick/Newsletter/Newsletter.types';
import * as Newsletter from 'src/components/Uptick/Newsletter/Newsletter';
import * as LoadMoreButton from 'src/components/Uptick/LoadMoreButton/LoadMoreButton';
import * as GoBackCtatypes from 'src/components/Uptick/GoBackCta/GoBackCta.types';
import * as GoBackCta from 'src/components/Uptick/GoBackCta/GoBackCta';
import * as EditorialSearchResulttypes from 'src/components/Uptick/EditorialSearchResult/EditorialSearchResult.types';
import * as EditorialSearchResult from 'src/components/Uptick/EditorialSearchResult/EditorialSearchResult';
import * as EditorialPageSearch from 'src/components/Uptick/EditorialPageHero/EditorialPageSearch';
import * as EditorialPageHerotypes from 'src/components/Uptick/EditorialPageHero/EditorialPageHero.types';
import * as EditorialPageHero from 'src/components/Uptick/EditorialPageHero/EditorialPageHero';
import * as SearchResultRelatedContentCards from 'src/components/Uptick/CardList/SearchResultRelatedContentCards';
import * as SearchResultFeaturedContent from 'src/components/Uptick/CardList/SearchResultFeaturedContent';
import * as SearchResultContentCardCarousel from 'src/components/Uptick/CardList/SearchResultContentCardCarousel';
import * as SearchResultCardListFeaturedTop from 'src/components/Uptick/CardList/SearchResultCardListFeaturedTop';
import * as SearchResultCardListContentByAuthor from 'src/components/Uptick/CardList/SearchResultCardListContentByAuthor';
import * as SearchResultCardListArticle from 'src/components/Uptick/CardList/SearchResultCardListArticle';
import * as SearchResultCardList from 'src/components/Uptick/CardList/SearchResultCardList';
import * as CardListDefaultItem from 'src/components/Uptick/CardList/CardListDefaultItem';
import * as CardListDefault from 'src/components/Uptick/CardList/CardListDefault';
import * as CardListtypes from 'src/components/Uptick/CardList/CardList.types';
import * as Cardtypes from 'src/components/Uptick/CardList/Card.types';
import * as Breadcrumbtypes from 'src/components/Uptick/Breadcrumb/Breadcrumb.types';
import * as Breadcrumb from 'src/components/Uptick/Breadcrumb/Breadcrumb';
import * as BannerWithCardstypes from 'src/components/Uptick/BannerWithCards/BannerWithCards.types';
import * as BannerWithCards from 'src/components/Uptick/BannerWithCards/BannerWithCards';
import * as VideoBlock from 'src/components/Uptick/ArticleDetail/VideoBlock';
import * as UptickTableOfContent from 'src/components/Uptick/ArticleDetail/UptickTableOfContent';
import * as UptickRelatedTags from 'src/components/Uptick/ArticleDetail/UptickRelatedTags';
import * as TwoColumnTextBlocktypes from 'src/components/Uptick/ArticleDetail/TwoColumnTextBlock.types';
import * as TwoColumnTextBlock from 'src/components/Uptick/ArticleDetail/TwoColumnTextBlock';
import * as TwoColumnQuoteBlocktypes from 'src/components/Uptick/ArticleDetail/TwoColumnQuoteBlock.types';
import * as TwoColumnQuoteBlock from 'src/components/Uptick/ArticleDetail/TwoColumnQuoteBlock';
import * as TitleBlocktypes from 'src/components/Uptick/ArticleDetail/TitleBlock.types';
import * as TitleBlock from 'src/components/Uptick/ArticleDetail/TitleBlock';
import * as TextBlocktypes from 'src/components/Uptick/ArticleDetail/TextBlock.types';
import * as TextBlock from 'src/components/Uptick/ArticleDetail/TextBlock';
import * as TestimonialRenderer from 'src/components/Uptick/ArticleDetail/TestimonialRenderer';
import * as TestimonialBlocktypes from 'src/components/Uptick/ArticleDetail/TestimonialBlock.types';
import * as TestimonialBlock from 'src/components/Uptick/ArticleDetail/TestimonialBlock';
import * as InteractiveBlock from 'src/components/Uptick/ArticleDetail/InteractiveBlock';
import * as ImageBlock from 'src/components/Uptick/ArticleDetail/ImageBlock';
import * as HorizontalLineBlock from 'src/components/Uptick/ArticleDetail/HorizontalLineBlock';
import * as ComponentFactory from 'src/components/Uptick/ArticleDetail/ComponentFactory';
import * as AudioPlaybackBlock from 'src/components/Uptick/ArticleDetail/AudioPlaybackBlock';
import * as ArticleDetailtypes from 'src/components/Uptick/ArticleDetail/ArticleDetail.types';
import * as ArticleDetail from 'src/components/Uptick/ArticleDetail/ArticleDetail';
import * as SearchResultCard from 'src/components/GeneralSearch/SearchResultCard';
import * as SearchPaginationBar from 'src/components/GeneralSearch/SearchPaginationBar';
import * as SearchInput from 'src/components/GeneralSearch/SearchInput';
import * as GeneralSearchtypes from 'src/components/GeneralSearch/GeneralSearch.types';
import * as GeneralSearch from 'src/components/GeneralSearch/GeneralSearch';

export const componentMap = new Map<string, NextjsContentSdkComponent>([
  ['BYOCWrapper', BYOCWrapper],
  ['FEaaSWrapper', FEaaSWrapper],
  ['Form', Form],
  ['Title', { ...Title }],
  ['Tabs', { ...Tabs }],
  ['RowSplitter', { ...RowSplitter }],
  ['RichText', { ...RichText }],
  ['PromoCards', { ...PromoCards }],
  ['Promo', { ...Promo }],
  ['ProductCards', { ...ProductCards }],
  ['PartialDesignDynamicPlaceholder', { ...PartialDesignDynamicPlaceholder }],
  ['PageContent', { ...PageContent }],
  ['Navigation', { ...Navigation }],
  ['MediaBannerIconList', { ...MediaBannerIconList }],
  ['LinkList', { ...LinkList }],
  ['Image', { ...Image }],
  ['IconCards', { ...IconCards }],
  ['FontSizeSelector', { ...FontSizeSelector }],
  ['ContentCards', { ...ContentCards }],
  ['ContentBlock', { ...ContentBlock }],
  ['Container', { ...Container }],
  ['ColumnSplitter', { ...ColumnSplitter }],
  ['Video', { ...Videotypes }],
  ['GPVideo', { ...GPVideo }],
  ['RegionSelectorModal', { ...RegionSelectorModal }],
  ['OverlayLinkHandler', { ...OverlayLinkHandler }],
  ['ModalProvider', { ...ModalProvider }],
  ['Modal', { ...Modal }],
  ['LottieAnimation', { ...LottieAnimationtypes, ...LottieAnimation }],
  ['Link', { ...Link }],
  ['ImageItem', { ...ImageItem }],
  ['Image', { ...Imagetypes }],
  ['GPImage', { ...GPImage }],
  ['Heading', { ...Heading }],
  ['GPMedia', { ...GPMediatypes, ...GPMedia }],
  ['cta', { ...ctatypes }],
  ['CTA', { ...CTA }],
  ['Button', { ...Button }],
  ['Brow', { ...Brow }],
  ['AOS', { ...AOS }],
  ['TrustPilotRefresher', { ...TrustPilotRefresher }],
  ['HeadlessHTMLSnippet', { ...HeadlessHTMLSnippet }],
  ['QuoteImage', { ...QuoteImagetypes, ...QuoteImage }],
  ['QuoteCardCarouselWrapper', { ...QuoteCardCarouselWrapper }],
  ['QuoteCardCarousel', { ...QuoteCardCarouseltypes, ...QuoteCardCarousel }],
  ['TabsComponent', { ...TabsComponenttypes, ...TabsComponent }],
  ['TableOfferMatrix', { ...TableOfferMatrixtypes, ...TableOfferMatrix }],
  ['TabNavVertical', { ...TabNavVerticaltypes, ...TabNavVertical }],
  ['SelectorBundleCards', { ...SelectorBundleCardstypes, ...SelectorBundleCards }],
  ['SearchTagResults', { ...SearchTagResultstype, ...SearchTagResults }],
  ['Results', { ...Results }],
  ['Pagination', { ...Pagination }],
  ['Filters', { ...Filters }],
  ['QuoteLogoFrame', { ...QuoteLogoFrametypes, ...QuoteLogoFrame }],
  ['QuoteCopyCard', { ...QuoteCopyCardtypes, ...QuoteCopyCard }],
  ['PromoCard', { ...PromoCardtypes, ...PromoCard }],
  ['ProductSpotlight', { ...ProductSpotlighttypes, ...ProductSpotlight }],
  ['ProductCard', { ...ProductCardtypes, ...ProductCard }],
  ['PlanSelectorCardText', { ...PlanSelectorCardText }],
  ['PlanSelectorCard', { ...PlanSelectorCardtypes, ...PlanSelectorCard }],
  ['PillLinkTable', { ...PillLinkTabletypes, ...PillLinkTable }],
  ['PageTemplates', { ...PageTemplatestypes, ...PageTemplates }],
  ['MediaBannerSteps', { ...MediaBannerStepstypes, ...MediaBannerSteps }],
  ['MediaBannerIcon', { ...MediaBannerIcontypes, ...MediaBannerIcon }],
  ['MediaBanner', { ...MediaBannertypes, ...MediaBanner }],
  ['LogoCarousel', { ...LogoCarouseltypes, ...LogoCarousel }],
  ['ContentList', { ...ContentListtypes, ...ContentList }],
  ['L2Hero', { ...L2Herotypes, ...L2Hero }],
  ['ImageParallaxTextBlock', { ...ImageParallaxTextBlocktypes, ...ImageParallaxTextBlock }],
  ['ImageInsetTestimonial', { ...ImageInsetTestimonialtypes, ...ImageInsetTestimonial }],
  ['IconCardList', { ...IconCardListtypes, ...IconCardList }],
  ['PromoHiLoCard', { ...PromoHiLoCardtype, ...PromoHiLoCard }],
  ['HiLoCards', { ...HiLoCards }],
  ['L4Hero', { ...L4Hero }],
  ['L3Hero', { ...L3Herotypes, ...L3Hero }],
  ['L1Hero', { ...L1Hero }],
  ['Hero', { ...Herotypes }],
  ['HeadlessForm', { ...HeadlessForm }],
  ['CustomFieldFactory', { ...CustomFieldFactory }],
  ['FormInPage', { ...FormInPagetypes, ...FormInPage }],
  ['FormBanner', { ...FormBannertypes, ...FormBanner }],
  ['FocusedCardCarousel', { ...FocusedCardCarouseltypes, ...FocusedCardCarousel }],
  ['featuredhero', { ...featuredherotypes }],
  ['FeaturedHero', { ...FeaturedHero }],
  ['FeaturedArticles', { ...FeaturedArticlestypes, ...FeaturedArticles }],
  ['featureVerticalVideo', { ...featureVerticalVideotypes, ...featureVerticalVideo }],
  ['FeatureContent', { ...FeatureContenttypes, ...FeatureContent }],
  ['RightToLeftCurveGlow', { ...RightToLeftCurveGlow }],
  ['RightToLeftCurve', { ...RightToLeftCurve }],
  ['Divider', { ...Dividertypes, ...Divider }],
  ['CentreRightLeftCurveGlow', { ...CentreRightLeftCurveGlow }],
  ['CenterRightLeftCenterGlow', { ...CenterRightLeftCenterGlow }],
  ['copybanner', { ...copybannertypes, ...copybanner }],
  ['ContentStats', { ...ContentStatstypes, ...ContentStats }],
  ['ContentLogoGrid', { ...ContentLogoGridtypes, ...ContentLogoGrid }],
  ['ContentCardsText', { ...ContentCardsText }],
  ['ContentCards', { ...ContentCardstypes }],
  ['CaseStudyHero', { ...CaseStudyHerotypes, ...CaseStudyHero }],
  ['CaseStudyCarousel', { ...CaseStudyCarouseltypes, ...CaseStudyCarousel }],
  ['CaseStudy', { ...CaseStudytypes, ...CaseStudy }],
  ['CardCarousel', { ...CardCarouseltypes, ...CardCarousel }],
  ['BlogCards', { ...BlogCardstypes, ...BlogCards }],
  ['BlogCardsCarousel', { ...BlogCardsCarousel }],
  ['BlogCard', { ...BlogCard }],
  ['Accordion', { ...Accordiontypes, ...Accordion }],
  ['ProductInterest', { ...ProductInterest }],
  ['QuickLinkList', { ...QuickLinkList }],
  ['Header', { ...Headertypes, ...Header }],
  ['Footer', { ...Footertypes, ...Footer }],
  ['VisitorIdentification', { ...VisitorIdentification, componentType: 'client' }],
  ['SitecoreTracking', { ...SitecoreTracking }],
  ['PageViewTracker', { ...PageViewTracker }],
  ['UptickTaxonomy', { ...UptickTaxonomytypes, ...UptickTaxonomy }],
  ['UptickHeroWithText', { ...UptickHeroWithTexttypes, ...UptickHeroWithText }],
  ['SocialSharing', { ...SocialSharing }],
  ['SearchResultAuthorCardList', { ...SearchResultAuthorCardList }],
  ['SMEContentBlock', { ...SMEContentBlock }],
  ['RelatedContentCardsDefault', { ...RelatedContentCardsDefault }],
  ['IframeCeros', { ...IframeCeros }],
  ['FeaturedContent', { ...FeaturedContent }],
  ['ContentCardCarouselSearch', { ...ContentCardCarouselSearch }],
  ['ContentCardCarousel', { ...ContentCardCarousel }],
  ['AuthorCardRenderer', { ...AuthorCardRenderer }],
  ['AuthorCardList', { ...AuthorCardListtypes, ...AuthorCardList }],
  ['AuthorCard', { ...AuthorCardtypes, ...AuthorCard }],
  ['ArticleBanner', { ...ArticleBannertypes, ...ArticleBanner }],
  ['UptickCard', { ...UptickCard }],
  ['Tags', { ...Tags }],
  ['ContentMeta', { ...ContentMetatypes, ...ContentMeta }],
  ['TaxonomyTags', { ...TaxonomyTagstype, ...TaxonomyTags }],
  ['Newsletter', { ...Newslettertypes, ...Newsletter }],
  ['LoadMoreButton', { ...LoadMoreButton }],
  ['GoBackCta', { ...GoBackCtatypes, ...GoBackCta }],
  ['EditorialSearchResult', { ...EditorialSearchResulttypes, ...EditorialSearchResult }],
  ['EditorialPageSearch', { ...EditorialPageSearch }],
  ['EditorialPageHero', { ...EditorialPageHerotypes, ...EditorialPageHero }],
  ['SearchResultRelatedContentCards', { ...SearchResultRelatedContentCards }],
  ['SearchResultFeaturedContent', { ...SearchResultFeaturedContent }],
  ['SearchResultContentCardCarousel', { ...SearchResultContentCardCarousel }],
  ['SearchResultCardListFeaturedTop', { ...SearchResultCardListFeaturedTop }],
  ['SearchResultCardListContentByAuthor', { ...SearchResultCardListContentByAuthor }],
  ['SearchResultCardListArticle', { ...SearchResultCardListArticle }],
  ['SearchResultCardList', { ...SearchResultCardList }],
  ['CardListDefaultItem', { ...CardListDefaultItem }],
  ['CardListDefault', { ...CardListDefault }],
  ['CardList', { ...CardListtypes }],
  ['Card', { ...Cardtypes }],
  ['Breadcrumb', { ...Breadcrumbtypes, ...Breadcrumb }],
  ['BannerWithCards', { ...BannerWithCardstypes, ...BannerWithCards }],
  ['VideoBlock', { ...VideoBlock }],
  ['UptickTableOfContent', { ...UptickTableOfContent }],
  ['UptickRelatedTags', { ...UptickRelatedTags }],
  ['TwoColumnTextBlock', { ...TwoColumnTextBlocktypes, ...TwoColumnTextBlock }],
  ['TwoColumnQuoteBlock', { ...TwoColumnQuoteBlocktypes, ...TwoColumnQuoteBlock }],
  ['TitleBlock', { ...TitleBlocktypes, ...TitleBlock }],
  ['TextBlock', { ...TextBlocktypes, ...TextBlock }],
  ['TestimonialRenderer', { ...TestimonialRenderer }],
  ['TestimonialBlock', { ...TestimonialBlocktypes, ...TestimonialBlock }],
  ['InteractiveBlock', { ...InteractiveBlock }],
  ['ImageBlock', { ...ImageBlock }],
  ['HorizontalLineBlock', { ...HorizontalLineBlock }],
  ['ComponentFactory', { ...ComponentFactory }],
  ['AudioPlaybackBlock', { ...AudioPlaybackBlock }],
  ['ArticleDetail', { ...ArticleDetailtypes, ...ArticleDetail }],
  ['SearchResultCard', { ...SearchResultCard }],
  ['SearchPaginationBar', { ...SearchPaginationBar }],
  ['SearchInput', { ...SearchInput }],
  ['GeneralSearch', { ...GeneralSearchtypes, ...GeneralSearch }],
]);

export default componentMap;
