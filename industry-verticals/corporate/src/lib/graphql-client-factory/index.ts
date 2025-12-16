import { createGraphQLClientFactory } from './create';

// The GraphQL client factory serves as the central hub for executing GraphQL requests
// Uses ContentSDK-compatible fetch-based approach instead of JSS GraphQLRequestClient

// Create a new instance on each import call
export default createGraphQLClientFactory();
