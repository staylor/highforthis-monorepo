import type { ApolloClient, OperationVariables } from '@apollo/client';
import { ServerError } from '@apollo/client/errors';
import type { DocumentNode } from 'graphql';

// The admin's data functions (the other modules in this folder) take one of these instead
// of a request, so they don't depend on React Router. It's the same interface as the public
// site's client (web/app/lib/graphql.ts), so the functions can move to Remix as they are.
export interface GraphQLClient {
  query<T>(query: DocumentNode, variables?: OperationVariables): Promise<T>;
  mutate<T>(mutation: DocumentNode, variables?: OperationVariables): Promise<T>;
}

interface ClientOptions {
  apolloClient: ApolloClient;
  // The signed-in user's token, read when an operation needs it
  token: () => Promise<string | undefined>;
  // Admin pages send the token with queries too; the media modals' queries go without it
  authenticateQueries: boolean;
}

function logError(e: unknown) {
  const error = e as Error;
  if (ServerError.is(error)) {
    console.error(error.bodyText);
  }
  console.error(error.message);
}

const authHeaders = (token?: string): Record<string, string> =>
  token ? { Authorization: `Bearer ${token}` } : {};

// Errors are logged and come back as empty data, so a page renders without the failed data
export function createGraphQLClient({
  apolloClient,
  token,
  authenticateQueries,
}: ClientOptions): GraphQLClient {
  return {
    async query<T>(query: DocumentNode, variables?: OperationVariables) {
      const headers = authHeaders(authenticateQueries ? await token() : undefined);
      try {
        const result = await apolloClient.query<T>({ query, variables, context: { headers } });
        return result.data as T;
      } catch (e) {
        logError(e);
        return {} as T;
      }
    },
    async mutate<T>(mutation: DocumentNode, variables?: OperationVariables) {
      const headers = authHeaders(await token());
      try {
        const result = await apolloClient.mutate<T>({ mutation, variables, context: { headers } });
        return (result.data ?? {}) as T;
      } catch (e) {
        logError(e);
        return {} as T;
      }
    },
  };
}
