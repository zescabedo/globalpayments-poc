// utils/graphqlFetcher.ts
import localDebug from '@/lib/_platform/logging/debug-log';
import config from '@/temp/config';
export async function graphqlFetcher<T = unknown>(
  query: string,
  variables: Record<string, unknown>,
  endpoint = `${config.graphQLEndpoint}`
): Promise<T> {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        sc_apikey: config.sitecoreApiKey,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
      throw new Error(`GraphQL request failed: ${res.status} ${res.statusText}`);
    }

    const json: { data: T } = await res.json();
    return json.data;
  } catch (err) {
    localDebug.graphqlFetcher('GraphQL fetch error:', err);
    throw err; // Let caller handle specific cases
  }
}
