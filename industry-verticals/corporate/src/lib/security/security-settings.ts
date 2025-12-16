import siteConfig from '@/temp/config';
import localDebug from '../_platform/logging/debug-log';
import { SECURITY_SETTINGS } from '../../constants/appConstants';
import { NextRequest } from 'next/server';

interface SitecoreSearchResult {
  targetHostName?: {
    value: string;
  };
  parent?: {
    parent?: {
      path: string;
    };
  };
}

interface SecurityDirective {
  name?: string;
  allowedHosts?: {
    jsonValue?: Array<{
      fields?: {
        Value?: {
          value: string;
        };
      };
    }>;
  };
  additionalHosts?: {
    value?: string;
  };
}

interface SecuritySettingsData {
  contentSecurityPolicy?: {
    results: Array<{
      isReportOnly: {
        jsonValue: boolean;
      };
      list: {
        results: Array<SecurityDirective>;
      };
    }>;
  };
  strictTransportPolicy?: {
    results: Array<{
      maxAge: {
        value: string;
      };
      includesubdomains: {
        value: boolean;
      };
      preload: {
        value: boolean;
      };
    }>;
  };
  xContentTypeOptions?: {
    results: Array<{
      enabled: {
        jsonValue: boolean;
      };
    }>;
  };
  xssProtection?: {
    results: Array<{
      enabled: {
        jsonValue: boolean;
      };
    }>;
  };
  referralPolicy?: {
    results: Array<{
      id: string;
      policy: {
        jsonValue: string;
      };
    }>;
  };
}

// Cache structure to store security settings by language
const securitySettingsCache: {
  [language: string]: {
    data: SecuritySettingsData;
    timestamp: number;
  };
} = {};

// Update the function signature to accept the request parameter
export async function getSecuritySettings(language: string, req?: NextRequest) {
  try {
    // Check if we have valid cached data
    const cachedData = securitySettingsCache[language];
    const now = Date.now();

    localDebug.headlessInfra(`[Security Settings] Checking cache for language: ${language}`);
    if (cachedData) {
      localDebug.headlessInfra(
        `[Security Settings] Cache found, age: ${(now - cachedData.timestamp) / 1000}s`
      );
    }

    if (cachedData && now - cachedData.timestamp < SECURITY_SETTINGS.CACHE_EXPIRATION) {
      localDebug.headlessInfra('[Security Settings] Returning cached data');
      return cachedData.data;
    }

    localDebug.headlessInfra('[Security Settings] Cache miss or expired, fetching fresh data');
    localDebug.headlessInfra(
      `[Security Settings] x-forwarded-host: ${req?.headers?.get('x-forwarded-host')}`
    );

    const siteQuery = `{
      search(where: {AND: [{name: "_templates", value: "E46F3AF239FA4866A1577017C4B2A40C", operator: CONTAINS}]}, first: 10) {
        results {
          name
          path
          language {
            name
          }
          parent {
            parent {
              path
            }
          }
          targetHostName: field(name: "TargetHostName") {
            value
          }
          siteName: field(name: "SiteName") {
            value
          }
        }
      }
    }`;

    const siteResponse = await fetch(siteConfig.graphQLEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        sc_apikey: process.env.SITECORE_API_KEY || '',
      },
      body: JSON.stringify({ query: siteQuery }),
    });

    const siteResult = await siteResponse.json();
    localDebug.headlessInfra(
      '[Security Settings] Site search results: %o',
      siteResult?.data?.search?.results
    );

    const siteInfo = siteResult?.data?.search?.results?.find(
      (site: SitecoreSearchResult) =>
        site.targetHostName?.value == req?.headers?.get('x-forwarded-host') &&
        site.parent?.parent?.path
    );

    localDebug.headlessInfra('[Security Settings] Selected site info: %o', siteInfo);

    if (!siteInfo?.parent?.parent?.path) {
      throw new Error('Site settings path not found');
    }

    localDebug.headlessInfra(
      `[Security Settings] Using datasource path: ${siteInfo.parent.parent.path}`
    );

    const securityQuery = `
      query SecuritySettings($datasource: String!, $language: String!, $listAfter: String) {
        item(path: $datasource, language: $language) {
          children(includeTemplateIDs: "a6d63cc160cc4e538a700228a90ed4a6", first: 1) {
            results {
              contentSecurityPolicy: children(
                includeTemplateIDs: "14e4990c0ec44f7fba83a3fa8acdd941"
                first: 2
              ) {
                results {
                  isReportOnly: field(name: "Report Only") {
                    jsonValue
                  }
                  list: children(
                    includeTemplateIDs: "ec2f720be08349b3af4d65a07b5af4da"
                    first: 4
                    after: $listAfter
                  ) {
                    results {
                      name
                      allowedHosts: field(name: "Allowed Hosts") {
                        ... on MultilistField {
                          jsonValue
                        }
                      }
                      additionalHosts: field(name: "Additional Hosts") {
                        value
                      }
                    }
                    pageInfo {
                      hasNext
                      endCursor
                    }
                  }
                }
              }
              strictTransportPolicy: children(
                includeTemplateIDs: "19fce6a4ee24425b82a9c5def18c7628"
                first: 1
              ) {
                results {
                  maxAge: field(name: "Max Age") {
                    value
                  }
                  includesubdomains: field(name: "Include sub domains") {
                    value
                  }
                  preload: field(name: "PreLoad") {
                    value
                  }
                }
              }
              xContentTypeOptions: children(
                includeTemplateIDs: "d02155b551204053b4dc00b3d72fdc8c"
                first: 1
              ) {
                results {
                  enabled: field(name: "Enabled") {
                    jsonValue
                  }
                }
              }
              xssProtection: children(
                includeTemplateIDs: "4ca98c4a9e1a40b4b1bf475994b184ea"
                first: 1
              ) {
                results {
                  enabled: field(name: "Enabled") {
                    jsonValue
                  }
                }
              }
              referralPolicy: children(
                includeTemplateIDs: "125ec14b94ab49f588cbf0f9a942ed1d"
                first: 1
              ) {
                results {
                  id
                  policy: field(name: "Policy") {
                    ... on LookupField {
                      jsonValue
                    }
                  }
                }
              }
            }
          }
        }
      }`;

    // Fetch all CSP directives with pagination
    const allCspDirectives: SecurityDirective[] = [];
    let hasNextPage = true;
    let afterCursor: string | null = null;
    let pageNumber = 1;

    while (hasNextPage) {
      const variables: { language: string; datasource: string; listAfter: string | null } = {
        datasource: siteInfo.parent.parent.path,
        language,
        listAfter: afterCursor,
      };

      const response = await fetch(siteConfig.graphQLEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          sc_apikey: process.env.SITECORE_API_KEY || '',
        },
        body: JSON.stringify({ query: securityQuery, variables }),
      });

      const result = await response.json();
      const currentSecuritySettings = result?.data?.item?.children?.results[0];

      if (!currentSecuritySettings) {
        break;
      }

      // Get current page CSP directives
      const currentDirectives =
        currentSecuritySettings?.contentSecurityPolicy?.results?.[0]?.list?.results || [];

      allCspDirectives.push(...currentDirectives);

      // Check if there are more pages
      const listPageInfo =
        currentSecuritySettings?.contentSecurityPolicy?.results?.[0]?.list?.pageInfo;
      hasNextPage = listPageInfo?.hasNext || false;
      afterCursor = listPageInfo?.endCursor || null;

      // Safety check to prevent infinite loops
      if (!afterCursor && hasNextPage) {
        break;
      }

      pageNumber++;
    }

    localDebug.headlessInfra(
      `[Security Settings] Total CSP directives collected: ${allCspDirectives.length}`
    );

    // Reconstruct security settings with all CSP directives
    const finalResult = await fetch(siteConfig.graphQLEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        sc_apikey: process.env.SITECORE_API_KEY || '',
      },
      body: JSON.stringify({
        query: securityQuery,
        variables: {
          datasource: siteInfo.parent.parent.path,
          language,
          listAfter: null,
        },
      }),
    });

    const finalResultData = await finalResult.json();
    const securitySettings = finalResultData?.data?.item?.children?.results[0] || {};

    // Replace the CSP list results with all collected directives
    if (securitySettings?.contentSecurityPolicy?.results?.[0]?.list) {
      securitySettings.contentSecurityPolicy.results[0].list.results = allCspDirectives;
    }

    localDebug.headlessInfra(
      '[Security Settings] Retrieved security settings: %o',
      securitySettings
    );

    // Cache the result
    securitySettingsCache[language] = {
      data: securitySettings,
      timestamp: now,
    };
    localDebug.headlessInfra('[Security Settings] Updated cache with fresh data');

    return securitySettings;
  } catch (error) {
    localDebug.headlessInfra('[Security Settings] Error fetching security settings:', error);
    return null;
  }
}

export type { SecurityDirective };
