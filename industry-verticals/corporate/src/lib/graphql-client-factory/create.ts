import scConfig from 'sitecore.config';

/**
 * GraphQL client factory compatible with JSS interface but using ContentSDK approach
 * This replaces JSS GraphQLRequestClient with a fetch-based implementation
 */
export interface GraphQLClient {
  request<T = unknown>(query: string, variables?: Record<string, unknown>): Promise<T>;
}

/**
 * Creates a GraphQL client factory compatible with JSS interface
 * Uses ContentSDK configuration and fetch-based approach
 */
export const createGraphQLClientFactory = () => {
  const getEndpoint = () => {
    if (scConfig.api?.edge?.url) {
      return `${scConfig.api.edge.url}/sitecore/api/graph/edge`;
    }
    if (scConfig.api?.local?.apiHost) {
      return `${scConfig.api.local.apiHost}/sitecore/api/graph/edge`;
    }
    if (process.env.NEXT_PUBLIC_SITECORE_EDGE_URL) {
      return `${process.env.NEXT_PUBLIC_SITECORE_EDGE_URL}/sitecore/api/graph/edge`;
    }
    throw new Error('GraphQL endpoint not configured');
  };

  const getHeaders = (): HeadersInit => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add API key header if using local mode
    const apiKey = scConfig.api?.local?.apiKey || process.env.SITECORE_API_KEY;
    if (apiKey) {
      headers['sc_apikey'] = apiKey;
    }

    // Add edge context ID if using edge mode
    if (scConfig.api?.edge?.contextId) {
      headers['sc_edgecontext'] = scConfig.api.edge.contextId;
    }

    return headers;
  };

  // Return a factory function that creates a client
  return (): GraphQLClient => {
    const endpoint = getEndpoint();
    const headers = getHeaders();

    return {
      request: async <T = unknown>(
        query: string,
        variables: Record<string, unknown> = {}
      ): Promise<T> => {
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify({ query, variables }),
          });

          if (!response.ok) {
            throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
          }

          const json = await response.json();

          if (json.errors) {
            throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
          }

          return json.data as T;
        } catch (error) {
          console.error('GraphQL request error:', error);
          throw error;
        }
      },
    };
  };
};
