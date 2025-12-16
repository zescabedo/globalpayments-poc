// src/lib/sitemap-fetcher/enhancedSitemapFetcher.ts

import { UptickUrlConfig } from '@/utils/uptick/linkResolver';
import localDebug from '../_platform/logging/debug-log';
import { executeGraphQL } from '../graphql/fetchGraphQL';
import { sitemapConstants, uptickConstants } from '@/constants/appConstants';

export interface SitemapItem {
  url: { path: string };
  language: { name: string };
  changeFrequency: { jsonValue: unknown };
  priority: { jsonValue: unknown };
  lastmod: { value: string };
  template?: { id: string }; // For wildcard pages that have template IDs
  slug?: { value: string }; // For the slug field used in URL generation
  isSME?: JsonValueBoolean; // For identifying SME pages
}

interface PageInfo {
  endCursor: string | null;
  hasNext: boolean;
}

interface GraphQLResponse {
  sitemap?: {
    results?: SitemapItem[];
    pageInfo?: PageInfo;
  };
}

interface SitemapSettingsResponse {
  search: { results: SitemapSettingsResult[] };
}

interface SitemapSettingsResult {
  path: string;
  excludelastmod?: { jsonValue?: { value?: boolean } };
  excludepriority?: { jsonValue?: { value?: boolean } };
  excludechangefrequency?: { jsonValue?: { value?: boolean } };
}

interface SitemapSettings {
  excludeLastMod: boolean;
  excludePriority: boolean;
  excludeChangeFrequency: boolean;
}

const {
  uptickContentRootId,
  uptickAuthorTemplateId,
  uptickIndustryTemplateId,
  uptickContentTemplateId,
} = uptickConstants;

const { jssSettingTemplateId, uptickSiteConfigurationTemplateId, basePageTemplateId, sitemapNavigationId } =
  sitemapConstants;

export async function fetchSitemapWithPagination(
  languages: string[],
  siteName: string
): Promise<SitemapItem[]> {
  const allResults: SitemapItem[] = [];

  try {
    const allLanguageResults = await Promise.all(
      languages.map(async (language) => {
        const languagePageResults: SitemapItem[] = [];
        let hasNextPage = true;
        let cursor: string | null = null;

        while (hasNextPage) {
          const variables = {
            language,
            after: cursor,
            siteName: siteName.toLowerCase(),
          };

          const query = `
            query GetSitemap($language: String!, $after: String, $siteName: String!) {
              sitemap: search(
                where: {
                    AND: [
                          { name: "site", operator: EQ, value: $siteName }
                          {
                            name: "_templates"
                            operator: CONTAINS
                            value: "${basePageTemplateId}"
                          }
                          {
                            name: "_language"
                            operator: EQ
                            value: $language
                          }
                          {
                            name: "NavigationFilter"
                            operator: NCONTAINS
                            value: "${sitemapNavigationId}"
                          }
                          {
                            name: "ExcludeFromCurrentRegionXmlSitemap"
                            operator: EQ
                            value: "false"
                          }
                        ]
                      }
                first: 35
                after: $after
                ) {
                  total
                  pageInfo {
                    endCursor
                    hasNext
                  }
                  results {
                    url {
                      path
                    }
                    language {
                      name
                    }
                    changeFrequency: field(name: "changefrequency") {
                      jsonValue
                    }
                    priority: field(name: "priority") {
                      jsonValue
                    }
                    lastmod: field(name: "_updated") {
                      jsonValue
                    }
                  }
                }
              }
          `;

          try {
            const response: GraphQLResponse = await executeGraphQL<GraphQLResponse>(
              query,
              variables
            );

            if (response?.sitemap?.results) {
              languagePageResults.push(...response.sitemap.results);
            }

            hasNextPage = response?.sitemap?.pageInfo?.hasNext || false;
            cursor = response?.sitemap?.pageInfo?.endCursor || null;
          } catch (error: unknown) {
            localDebug.sitemap.error('[Sitemap] Error fetching sitemap page:', error);
            break;
          }
        }
        return languagePageResults;
      })
    );

    allResults.push(...allLanguageResults.flat());
    return allResults;
  } catch (error) {
    localDebug.sitemap.error('[Sitemap] Error in fetchSitemapWithPagination:', error);
    throw error;
  }
}

export async function fetchUptickWildcardPages(
  languages: string[],
  siteConfig: UptickUrlConfig
): Promise<SitemapItem[]> {
  const allResults: SitemapItem[] = [];

  const siteShowInID = siteConfig.siteShowInID || null;

  const query = `
  query fetchUptickWildcardPages($after: String, $language: String, $ShowIn: String) {
        sitemap:search(
          where: {
            AND: [
              {
                name: "_path"
                value: "${uptickContentRootId}" # Global content root
                operator: CONTAINS
              }
              {
                OR: [
                  { name: "_templates", value: "${uptickAuthorTemplateId}", operator: CONTAINS } # accept payment
                  { name: "_templates", value: "${uptickContentTemplateId}", operator: CONTAINS } # another topic
                  { name: "_templates", value: "${uptickIndustryTemplateId}", operator: CONTAINS } # third topic
                ]
              }
              { name: "_language", value: $language, operator: EQ }
              { name: "ShowIn", value:$ShowIn , operator: EQ }
            ]
          }
          first: 25
          after: $after
        ) {
          total
          pageInfo {
            endCursor
            hasNext
          }
          results {
            url {
              path
            }
            language {
              name
            }
            template {
              id
            }
            changeFrequency: field(name: "changefrequency") {
              jsonValue
            }
            priority: field(name: "priority") {
              jsonValue
            }
            lastmod: field(name: "__updated") {
              value
            }
            slug: field(name:"slug"){
              value
            }
            isSME: field(name: "isSME") {
              jsonValue
            }
          }
        }
      }
    `;

  try {
    const allLanguageResults = await Promise.all(
      languages.map(async (language) => {
        const languagePageResults: SitemapItem[] = [];
        let hasNextPage = true;
        let cursor: string | null = null;

        while (hasNextPage) {
          const variables = {
            language,
            after: cursor,
            ShowIn: siteShowInID,
          };

          const response: GraphQLResponse = await executeGraphQL<GraphQLResponse>(query, variables);

          if (response?.sitemap?.results) {
            languagePageResults.push(...response.sitemap.results);
          }

          hasNextPage = response?.sitemap?.pageInfo?.hasNext || false;
          cursor = response?.sitemap?.pageInfo?.endCursor || null;
        }

        return languagePageResults;
      })
    );

    allResults.push(...allLanguageResults.flat());
    return allResults;
  } catch (error) {
    localDebug.sitemap.error('[Sitemap] Error in fetchGlobalWildcardPages:', error);
    throw error;
  }
}

export async function fetchSitemapSetting(siteName?: string): Promise<SitemapSettings | null> {
  const query = `
    query GetSitemapSettings {
      search(
        where: {
          AND: [
            {
              name: "_templates"
              value: "${jssSettingTemplateId}"
              operator: CONTAINS
            }
          ]
        }
        first: 10
      ) {
        results {
          path
          excludelastmod: field(name: "excludelastmod") {
            jsonValue
          }
          excludepriority: field(name: "excludepriority") {
            jsonValue
          }
          excludechangefrequency: field(name: "excludechangefrequency") {
            jsonValue
          }
        }
      }
    }
  `;

  try {
    const response = await executeGraphQL<SitemapSettingsResponse>(query);
    const results = response?.search?.results;

    if (!results?.length) {
      return null;
    }

    const buildguideSettings = results.find((result: SitemapSettingsResult) =>
      result.path.includes(`${siteName}`)
    );

    if (!buildguideSettings) {
      return null;
    }

    return {
      excludeLastMod: buildguideSettings.excludelastmod?.jsonValue?.value || false,
      excludePriority: buildguideSettings.excludepriority?.jsonValue?.value || false,
      excludeChangeFrequency: buildguideSettings.excludechangefrequency?.jsonValue?.value || false,
    };
  } catch (error) {
    localDebug.sitemap.error('[Sitemap] Error fetching sitemap settings:', error);
    return null;
  }
}

// Add this interface for the site configuration response
interface SiteConfigurationResponse {
  siteConfiguration: {
    results: {
      contentWildcard?: { jsonValue?: { url?: string } };
      authorWildcard?: { jsonValue?: { url?: string } };
      industryWildcard?: { jsonValue?: { url?: string } };
      contentTypeQuerystringField?: { jsonValue?: { value?: string } };
      topicQuerystringField?: { jsonValue?: { value?: string } };
      productQuerystringField?: { jsonValue?: { value?: string } };
      breadcrumbOverrideLabelField?: { jsonValue?: { value?: string } };
      allContentPage?: { jsonValue?: { url?: string } };
      uptickHomePage?: { jsonValue?: { url?: string } };
      authorsListingPage?: { jsonValue?: { url?: string } };
      smeListingPage?: { jsonValue?: { url?: string } };
      smeWildcard?: { jsonValue?: { url?: string } };
      siteShowInId: {
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
    }[];
  };
}

// Add this function to fetch site configuration
export async function fetchSiteConfiguration(
  siteRootId: string,
  language: string = 'en-US'
): Promise<UptickUrlConfig | null> {
  const query = `
    query siteConfiguration($siteRootId: String!, $language: String!) {
      siteConfiguration: search(
        where: {
          AND: [
            { name: "_path", value: $siteRootId, operator: CONTAINS }
            {
              name: "_templates"
              value: "${uptickSiteConfigurationTemplateId}"
              operator: EQ
            }
            { name: "_language", value: $language, operator: EQ }
          ]
        }
      ) {
        results {
          contentWildcard: field(name: "ContentWildcard") {
            jsonValue
          }
          authorWildcard: field(name: "AuthorWildcard") {
            jsonValue
          }
          industryWildcard: field(name: "IndustryWildcard") {
            jsonValue
          }
          contentTypeQuerystringField: field(name: "ContentTypeQuerystringField") {
            jsonValue
          }
          topicQuerystringField: field(name: "TopicQuerystringField") {
            jsonValue
          }
          productQuerystringField: field(name: "ProductQuerystringField") {
            jsonValue
          }
          breadcrumbOverrideLabelField: field(name: "BreadcrumbOverrideLabel") {
            jsonValue
          }
          allContentPage: field(name: "AllContentPage") {
            jsonValue
          }
          uptickHomePage: field(name: "UptickHomePage") {
            jsonValue
          }
          authorsListingPage: field(name: "AuthorsListingPage") {
            jsonValue
          }
          smeWildcard: field(name: "SmeWildcard") {
            jsonValue
          }
          smeListingPage: field(name: "SmeListingPage") {
            jsonValue
          }
          siteShowInId: field(name: "siteShowInId") {
            jsonValue
          }
        }
      }
    }
  `;

  try {
    const response: SiteConfigurationResponse = await executeGraphQL<SiteConfigurationResponse>(
      query,
      { siteRootId, language }
    );

    const result = response?.siteConfiguration?.results?.[0];

    localDebug.sitemap.debug(`[Sitemap] Fetched site configuration: ${JSON.stringify(result)}`);

    if (result) {
      return {
        contentTypeQuerystringField: result.contentTypeQuerystringField?.jsonValue?.value || '',
        topicQuerystringField: result.topicQuerystringField?.jsonValue?.value || '',
        productQuerystringField: result.productQuerystringField?.jsonValue?.value || '',
        breadcrumbOverrideLabelField: result.breadcrumbOverrideLabelField?.jsonValue?.value || '',
        contentWildcard: result.contentWildcard?.jsonValue?.url || '',
        industryWildcard: result.industryWildcard?.jsonValue?.url || '',
        allContentPage: result.allContentPage?.jsonValue?.url || '',
        authorWildcard: result.authorWildcard?.jsonValue?.url || '',
        uptickHomePage: result.uptickHomePage?.jsonValue?.url || '',
        authorsListingPage: result.authorsListingPage?.jsonValue?.url || '',
        smeListingPage: result.smeListingPage?.jsonValue?.url || '',
        smeWildcard: result.smeWildcard?.jsonValue?.url || '',
        siteShowInID:
          result.siteShowInId?.jsonValue?.fields?.Value?.value?.replace(/[{}]/g, '') ===
          siteRootId?.replace(/[{}]/g, '')
            ? result?.siteShowInId?.jsonValue?.id
            : null,
      };
    }
  } catch (error) {
    localDebug.sitemap.error('[Sitemap] Failed to fetch site configuration:', error);
  }

  // Return null if fetch failed - we'll use fallback in the calling code
  return null;
}
