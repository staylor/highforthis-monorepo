import { redirect, type RouterContextProvider } from 'react-router';

import { isAuthenticated } from '#/auth';
import { apolloClientContext, graphqlHostContext } from '#/context';
import { isRedirect, type FormArgs, type RedirectResult } from '#/server/forms';
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

// Turns a data function's redirect into a redirect response, and passes anything else through
export function respond<T>(result: T): Response | Exclude<T, RedirectResult> {
  if (isRedirect(result)) {
    return redirect(result.redirectTo);
  }
  return result as Exclude<T, RedirectResult>;
}

type DeleteRows = (args: FormArgs) => Promise<RedirectResult>;

// List tables delete with a POST carrying intent=delete, since HTML forms can only GET or
// POST. Routes that also take other POSTs check this first; it reads a copy of the body, so
// the request can still be read afterwards.
export async function isDeleteIntent(request: Request) {
  return request.method === 'POST' && (await request.clone().formData()).get('intent') === 'delete';
}

// The list table's row and bulk forms always post an intent, even an empty one when no bulk
// action is chosen. The inline toggles on some list pages post without one.
export async function isListTableIntent(request: Request) {
  return request.method === 'POST' && (await request.clone().formData()).has('intent');
}

// A list page's delete form removes the checked rows; anything else comes back to the list
export async function deleteAction(
  { request, context, url }: RouteArgs & { url: URL },
  deleteRows: DeleteRows
) {
  if (!(await isDeleteIntent(request))) {
    return redirect(url.toString());
  }
  const gql = graphqlClient({ request, context });
  return respond(await deleteRows({ gql, formData: await request.formData(), url }));
}
