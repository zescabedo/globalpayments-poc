import fs from 'fs';
import { getIntrospectionQuery } from 'graphql';
import scConfig from '../sitecore.config';

// This script loads graphql introspection data in order to use graphql code generator and generate typescript types
// The `graphql:update` command should be executed when Sitecore templates related to the site are altered.

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

const endpoint = getEndpoint();
const headers = getHeaders();

console.log(`Fetch graphql introspection data from ${endpoint}...`);

fetch(endpoint, {
  method: 'POST',
  headers,
  body: JSON.stringify({ query: getIntrospectionQuery() }),
})
  .then((response) => {
    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
    }
    return response.json();
  })
  .then((result) => {
    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }
    fs.writeFile(
      './src/temp/GraphQLIntrospectionResult.json',
      JSON.stringify(result.data, null, 2),
      (err) => {
        if (err) {
          console.error('Error writing GraphQLIntrospectionResult file', err);
          return;
        }

        console.log('GraphQL Introspection Data successfully fetched!');
      }
    );
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
