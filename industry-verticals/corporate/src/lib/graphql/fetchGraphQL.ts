import graphQLClientFactory from '../graphql-client-factory';

export const executeGraphQL = async <T>(query: string, variables = {}): Promise<T> => {
  const client = graphQLClientFactory({});
  return client.request(query, variables);
};
