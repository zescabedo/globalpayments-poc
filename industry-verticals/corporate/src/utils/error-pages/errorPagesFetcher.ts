import { GraphQLClient } from 'graphql-request';
import config from 'temp/config';
import debug from '@/lib/_platform/logging/debug-log';
import { siteResolver } from '@/lib/site-resolver';

type ErrorPageContent = {
  rendered?: string;
};

type ErrorHandling = {
  notFoundPage?: ErrorPageContent;
  notFoundPagePath?: string;
  serverErrorPage?: ErrorPageContent;
  serverErrorPagePath?: string;
};

type SiteInfo = {
  errorHandling?: ErrorHandling;
};

type Site = {
  siteInfo?: SiteInfo;
};

type ErrorPagesQueryResponse = {
  site?: Site;
};

const ERROR_PAGES_QUERY = `
  query ErrorPagesQuery($siteName: String!, $language: String!) {
    site {
      siteInfo(site: $siteName) {
        errorHandling(language: $language) {
          notFoundPage {
            rendered
          }
          notFoundPagePath
          serverErrorPage {
            rendered
          }
          serverErrorPagePath
        }
      }
    }
  }
`;

export type ErrorPageResponse = {
  notFoundPagePath?: string;
  serverErrorPagePath?: string;
};

export async function fetchErrorPagePath(
  locale = 'en',
  errorType: '404' | '500' = '404'
): Promise<string | null> {
  const log = debug.gpn;
  const client = new GraphQLClient(`${config.graphQLEndpoint}?sc_apikey=${config.sitecoreApiKey}`);
  const site = siteResolver.getByHost(config.sitecoreApiHost);
  try {
    const errorPagesResponse = await client.request<ErrorPagesQueryResponse>(ERROR_PAGES_QUERY, {
      siteName: site?.name,
      language: locale,
    });

    const errorHandling = errorPagesResponse?.site?.siteInfo?.errorHandling;

    if (!errorHandling) {
      log(`Error handling data not found in GraphQL response`);
      return null;
    }

    const pagePath =
      errorType === '404' ? errorHandling.notFoundPagePath : errorHandling.serverErrorPagePath;

    if (!pagePath) {
      log(`${errorType} page path not found in GraphQL response`);
      return null;
    }

    return pagePath;
  } catch (error) {
    log(`Error occurred while fetching ${errorType} page: ${(error as Error).message}`);
    return null;
  }
}
