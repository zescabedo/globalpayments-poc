import scConfig from 'sitecore.config';

/**
 * Execute a GraphQL query using ContentSDK-compatible approach
 * This replaces the JSS GraphQL client with a simple fetch-based approach
 */
export const executeGraphQL = async <T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> => {
  const endpoint = scConfig.api?.edge?.url 
    ? `${scConfig.api.edge.url}/sitecore/api/graph/edge`
    : scConfig.api?.local?.apiHost
    ? `${scConfig.api.local.apiHost}/sitecore/api/graph/edge`
    : process.env.NEXT_PUBLIC_SITECORE_EDGE_URL
    ? `${process.env.NEXT_PUBLIC_SITECORE_EDGE_URL}/sitecore/api/graph/edge`
    : '';

  if (!endpoint) {
    throw new Error('GraphQL endpoint not configured. Please set SITECORE_EDGE_URL or configure sitecore.config.ts');
  }

  const apiKey = scConfig.api?.edge?.contextId 
    ? undefined // Edge uses context ID, not API key
    : scConfig.api?.local?.apiKey || process.env.SITECORE_API_KEY || '';

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add API key header if using local mode
  if (apiKey) {
    headers['sc_apikey'] = apiKey;
  }

  // Add edge context ID if using edge mode
  if (scConfig.api?.edge?.contextId) {
    headers['sc_edgecontext'] = scConfig.api.edge.contextId;
  }

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
    console.error('GraphQL fetch error:', error);
    throw error;
  }
};
