import {
  SitecorePageProps as ContentSDKPageProps,
} from '@sitecore-content-sdk/nextjs';

/**
 * Sitecore page props - using ContentSDK types
 * ContentSDK provides the SitecorePageProps type which includes:
 * - page: Page data from ContentSDK
 * - dictionary: Dictionary phrases
 * - componentProps: Component props collection
 * - notFound: boolean indicating if page was found
 */
export type SitecorePageProps = ContentSDKPageProps;
