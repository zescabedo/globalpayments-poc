import { GraphQLSiteInfoService, SiteInfo } from '@sitecore-jss/sitecore-jss-nextjs';
import { createGraphQLClientFactory } from 'lib/graphql-client-factory/create';
import { JssConfig } from 'lib/config';
import { ConfigPlugin } from '..';
import localDebug from '@/lib/_platform/logging/debug-log';

/**
 * This plugin will set the "sites" config prop.
 * By default this will attempt to fetch site information directly from Sitecore (using the GraphQLSiteInfoService).
 * You could easily modify this to fetch from another source such as a static JSON file instead.
 */

interface GraphQLSiteResult {
  name: string;
  path: string;
  language: {
    name: string;
  };
  parent?: {
    parent?: {
      path: string;
    };
  } | null;
  targetHostName: {
    value: string;
  };
  siteName: {
    value: string;
  };
  virtualDirectory: {
    value: string;
  };
  hostName: {
    value: string;
  };
}

interface GraphQLSearchResponse {
  search: {
    results: GraphQLSiteResult[];
  };
}

interface ExtendedSiteInfo extends SiteInfo {
  targetHostName?: string;
  virtualFolder?: string;
  [key: string]: any;
}

class MultisitePlugin implements ConfigPlugin {
  order = 11;

  async exec(config: JssConfig) {
    let sites: ExtendedSiteInfo[] = [];
    localDebug.headlessInfra('[MultisitePlugin] Fetching site information');
    try {
      // Create custom GraphQL client to fetch extended site info
      const clientFactory = createGraphQLClientFactory(config);
      const client = clientFactory({});

      // Custom query to get all site fields including target hostname and virtual folder
      const query = `
          {
            search(
              where: {
                AND: [
                  {
                    name: "_templates"
                    value: "E46F3AF239FA4866A1577017C4B2A40C"
                    operator: CONTAINS
                  }
                ]
              }
              first: 40
            ) {
              results {
                name
                language {
                  name
                }
                targetHostName: field(name: "TargetHostName") {
                  value
                }
                siteName: field(name: "SiteName") {
                  value
                }
                virtualDirectory: field(name: "VirtualFolder") {
                  value
                }
                hostName: field(name: "HostName") {
                  value
                }
              }
            }
          }
        `;

      const result = await client.request<GraphQLSearchResponse>(query, {
        language: config.defaultLanguage,
      });

      // Process and flatten the results
      sites = this.processSiteResults(result?.search?.results || []);
      localDebug.headlessInfra('[MultisitePlugin] fetched sites: %o', sites);
    } catch (error) {
      localDebug.headlessInfra.error('Error fetching extended site information: %o', error);

      // Fallback to default service if custom query fails
      try {
        const siteInfoService = new GraphQLSiteInfoService({
          clientFactory: createGraphQLClientFactory(config),
        });
        sites = await siteInfoService.fetchSiteInfo();
        localDebug.headlessInfra.info('[MultisitePlugin] Fallback to basic site resolution: %o', sites);
      } catch (fallbackError) {
        localDebug.headlessInfra.error('[MultisitePlugin] Fallback site fetch also failed');
        throw fallbackError;
      }
    }

    return Object.assign({}, config, {
      sites: JSON.stringify(sites),
    });
  }

  private processSiteResults(results: any[]): ExtendedSiteInfo[] {
    const sites: ExtendedSiteInfo[] = [];

    results.forEach((result) => {
      if (result.hostName?.value) {
        sites.push({
          name: result.siteName?.value || result.name,
          hostName: result.hostName.value,
          targetHostName: result.targetHostName?.value || '',
          virtualFolder: result.virtualDirectory?.value || '',
          language: result.language?.name || 'en',
        });
      }
    });

    return sites;
  }
}

export const multisitePlugin = new MultisitePlugin();
