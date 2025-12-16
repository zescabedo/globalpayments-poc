import { SitecoreClient } from '@sitecore-content-sdk/nextjs/client';
import scConfig from 'sitecore.config';

/**
 * SitecoreClient instance for ContentSDK
 * ContentSDK uses a unified SitecoreClient instead of separate Layout and Dictionary services
 * This follows the pattern from the reference XM Cloud project
 */
const client = new SitecoreClient({
  ...scConfig,
});

export default client;






