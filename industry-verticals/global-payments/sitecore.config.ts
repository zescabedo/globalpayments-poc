import { defineConfig } from '@sitecore-content-sdk/nextjs/config';
/**
 * @type {import('@sitecore-content-sdk/nextjs/config').SitecoreConfig}
 * See the documentation for `defineConfig`:
 * https://doc.sitecore.com/xmc/en/developers/content-sdk/the-sitecore-configuration-file.html
 */
export default defineConfig({
  api: {
    edge: {
      contextId: process.env.SITECORE_EDGE_CONTEXT_ID || '83a4b455-0153-4027-17b2-08daa1fe42ee',
      clientContextId:
        process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID || '83a4b455-0153-4027-17b2-08daa1fe42ee',
    },
  },
  personalize: {
    enabled: true,
  },
  multisite: {
    enabled: false,
  }
});
