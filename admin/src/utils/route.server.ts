import type { RouterContextProvider } from 'react-router';

import { isAuthenticated } from '#/auth';
import { apolloClientContext, graphqlHostContext } from '#/context';
import { createGraphQLClient, type GraphQLClient } from '#/server/graphql';

// Glue between React Router's loaders and actions and the data functions in #/server, which
// take plain inputs and don't import React Router.

interface RouteArgs {
  request: Request;
  context: Readonly<RouterContextProvider>;
}

// A GraphQL client for this request, sending the session's token
export function graphqlClient({ request, context }: RouteArgs): GraphQLClient {
  return createGraphQLClient({
    apolloClient: context.get(apolloClientContext),
    token: () => isAuthenticated(request),
    authenticateQueries: request.url.includes('/admin'),
  });
}

// What the REST endpoints on the GraphQL server (sign-in, passkeys) need
export async function graphqlAuth({ request, context }: RouteArgs) {
  return {
    graphqlHost: context.get(graphqlHostContext),
    token: (await isAuthenticated(request)) as string | undefined,
  };
}
