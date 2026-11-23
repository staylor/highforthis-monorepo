import { cop } from 'remix/middleware/cop';
import { createRedirectResponse } from 'remix/response/redirect';
import { createContextKey, type Middleware } from 'remix/router';

import { adminToken, expiredAdminCookie } from '#/lib/adminSession.ts';
import { createGraphQLClient, graphqlFetch, type GraphQLClient } from '#/lib/graphql.ts';

// List both on every admin controller, `sameOrigin()` first: controller middleware doesn't
// apply to nested route maps.

interface AdminSession {
  token: string;
  gql: GraphQLClient;
}

export const Admin = createContextKey<AdminSession>();

const loginRedirect = (init?: ResponseInit) => createRedirectResponse('/login/unauthorized', init);

/**
 * Lets the request through only with an admin session GraphQL accepts, and puts it on
 * `context.admin`. Signed-out people go to the login page, a session GraphQL rejects is
 * removed, and it answers 503 when GraphQL can't say.
 */
export function requireAdmin(): Middleware<{
  key: typeof Admin;
  value: AdminSession;
  property: 'admin';
}> {
  return async (context, next) => {
    const token = await adminToken(context.request.headers.get('cookie'));
    if (!token) {
      return loginRedirect();
    }

    const response = await graphqlFetch('/auth/session', {
      headers: { Authorization: `Bearer ${token}` },
    });
    await response.body?.cancel();
    if (response.status === 401 || response.status === 403) {
      return loginRedirect({ headers: { 'Set-Cookie': await expiredAdminCookie() } });
    }
    if (!response.ok) {
      return new Response('Unable to validate the admin session', { status: 503 });
    }

    context.set(Admin, { token, gql: createGraphQLClient(token) }, { property: 'admin' });
    return next();
  };
}

const crossOriginProtection = cop({
  onDeny: () => new Response('Bad Request', { status: 400 }),
});

/**
 * Rejects posts from anywhere but this site with a 400. Browsers say where a request came from in
 * `Sec-Fetch-Site`, which pages can't set: anything but `same-origin` (or `none`, typed into the
 * address bar) is turned away, other subdomains of this site included. Without it, an `Origin`
 * that doesn't match this request's host is. A request with neither didn't come from a browser,
 * so it can't carry an admin's cookie, and passes. On Railway the request URL has the public
 * host, because the server trusts the edge's forwarded headers.
 */
export function sameOrigin(): Middleware {
  return crossOriginProtection;
}
