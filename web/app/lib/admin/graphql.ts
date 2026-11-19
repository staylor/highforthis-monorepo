import type { OperationVariables } from '@apollo/client/core';
import type { DocumentNode } from 'graphql';

import { createApolloClient, logError, type GraphQLClient } from '../graphql.ts';

/**
 * GraphQL for admin pages: every operation sends the admin's token, and a failed query or
 * mutation is logged and comes back as empty data, as in the admin app's client. The admin's
 * data functions check for empty data to report a failed save or delete.
 */
export function createAdminGraphQLClient(token: string): GraphQLClient {
  const client = createApolloClient();
  const context = { headers: { Authorization: `Bearer ${token}` } };

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
      try {
        const result = await client.mutate<T>({ mutation, variables, context });
        return (result.data ?? {}) as T;
      } catch (e) {
        logError(e);
        return {} as T;
      }
    },
  };
}
