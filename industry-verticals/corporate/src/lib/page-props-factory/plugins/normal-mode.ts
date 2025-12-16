import { GetServerSidePropsContext, GetStaticPropsContext } from 'next';
import { SitecoreClient } from '@sitecore-content-sdk/nextjs';
import { sitecoreClientFactory } from 'lib/sitecore-client-factory';
import { SitecorePageProps } from 'lib/page-props';
import { pathExtractor } from 'lib/extract-path';
import { Plugin, isServerSidePropsContext } from '..';
import localDebug from '@/lib/_platform/logging/debug-log';

class NormalModePlugin implements Plugin {
  private clients: Map<string, SitecoreClient>;

  order = 1;

  constructor() {
    this.clients = new Map<string, SitecoreClient>();
  }

  async exec(props: SitecorePageProps, context: GetServerSidePropsContext | GetStaticPropsContext) {
    if (context.preview) return props;

    // Get normalized Sitecore item path
    const path = pathExtractor.extract(context.params);

    // Use context locale if Next.js i18n is configured, otherwise use default site language
    props.locale = context.locale ?? props.site.language;

    // Fetch layout data with error handling using unified SitecoreClient
    try {
      const client = this.getClient(props.site.name);
      
      // Fetch layout data
      props.layoutData = await client.layout.fetchLayoutData(
        path,
        props.locale,
        // eslint-disable-next-line prettier/prettier
        isServerSidePropsContext(context) ? (context as GetServerSidePropsContext).req : undefined,
        isServerSidePropsContext(context) ? (context as GetServerSidePropsContext).res : undefined
      );

      // Check if route exists with safe null checks
      if (!props.layoutData?.sitecore?.route) {
        // A missing route value signifies an invalid path, so set notFound.
        // Our page routes will return this in getStatic/ServerSideProps,
        // which will trigger our custom 404 page with proper 404 status code.
        localDebug.gpn(
          `[404] Route not found: ${path} (locale: ${props.locale}, site: ${props.site.name})`
        );
        props.notFound = true;
      }
    } catch (error) {
      // Log the error for debugging
      localDebug.gpn.error(`[ERROR] Failed to fetch layout data for path: ${path}`, {
        locale: props.locale,
        site: props.site.name,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Treat service errors as 404 to avoid exposing internal errors
      // This provides graceful degradation when Sitecore is unreachable
      props.notFound = true;

      // Return early
      return props;
    }

    // Fetch dictionary data only if layout was successful
    if (!props.notFound) {
      try {
        const client = this.getClient(props.site.name);
        props.dictionary = await client.dictionary.fetchDictionaryData(props.locale);
      } catch (error) {
        localDebug.gpn.error(`[ERROR] Failed to fetch dictionary data`, {
          locale: props.locale,
          site: props.site.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        // Continue with empty dictionary - translations are non-critical
        props.dictionary = {};
      }
    }

    return props;
  }

  private getClient(siteName: string): SitecoreClient {
    if (this.clients.has(siteName)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.clients.get(siteName)!;
    }

    const client = sitecoreClientFactory.create(siteName);
    this.clients.set(siteName, client);

    return client;
  }
}

export const normalModePlugin = new NormalModePlugin();
