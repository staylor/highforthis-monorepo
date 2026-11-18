import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client/core';
import type { OperationVariables } from '@apollo/client/core';
import { ServerError } from '@apollo/client/errors';
import type { DocumentNode } from 'graphql';

import fragmentMatcher from '@highforthis/shared/apollo/fragmentMatcher';
import typePolicies from '@highforthis/shared/apollo/typePolicies';

// Accept either a base URL or a legacy /graphql URL.
const configuredGqlHost = process.env.GQL_HOST || 'http://localhost:8081';
export const graphqlHost = configuredGqlHost.replace(/\/graphql\/?$/, '').replace(/\/$/, '');

export interface GraphQLClient {
  query<T>(query: DocumentNode, variables?: OperationVariables): Promise<T>;
  mutate<T>(mutation: DocumentNode, variables?: OperationVariables): Promise<T>;
}

/**
 * One Apollo client per request. Apollo Client's core has no React
 * dependency, so the existing cache config and type policies carry over unchanged.
 */
export function createGraphQLClient(token?: string): GraphQLClient {
  const client = new ApolloClient({
    link: new HttpLink({ uri: `${graphqlHost}/graphql` }),
    cache: new InMemoryCache({
      possibleTypes: fragmentMatcher.possibleTypes,
      typePolicies,
    }),
  });
  const context = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;

  return {
    async query<T>(query: DocumentNode, variables?: OperationVariables) {
      try {
        const result = await client.query<T>({ query, variables, context });
        return (result.data ?? {}) as T;
      } catch (e) {
        logError(e);
        return {} as T;
      }
    },
    async mutate<T>(mutation: DocumentNode, variables?: OperationVariables) {
      const result = await client.mutate<T>({ mutation, variables, context });
      return result.data as T;
    },
  };
}

function logError(e: unknown) {
  const error = e as Error;
  if (ServerError.is(error)) {
    console.error(error.bodyText);
  }
  console.error(error.message);
}
