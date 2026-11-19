import { createRedirectResponse } from 'remix/response/redirect';
import { createContextKey, type Middleware } from 'remix/router';

import { createAdminGraphQLClient } from '../lib/admin/graphql.ts';
import { adminToken, expiredAdminCookie } from '../lib/adminSession.ts';
import { graphqlHost, type GraphQLClient } from '../lib/graphql.ts';

// Middleware for the admin's pages. React Router gave the admin app both of these checks for
// free before it moved here. List both on every admin controller, `sameOrigin()` first:
// controller middleware doesn't apply to nested route maps.

interface AdminSession {
  token: string;
  gql: GraphQLClient;
}

export const Admin = createContextKey<AdminSession>();

// Looked up per request rather than captured at startup, so tests can stub fetch.
const fetchNow: typeof fetch = (input, init) => globalThis.fetch(input, init);

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
    const token = adminToken(context.request.headers.get('cookie'));
    if (!token) {
      return loginRedirect();
    }

    const response = await fetchNow(`${graphqlHost}/auth/session`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await response.body?.cancel();
    if (response.status === 401 || response.status === 403) {
      return loginRedirect({ headers: { 'Set-Cookie': expiredAdminCookie() } });
    }
    if (!response.ok) {
      return new Response('Unable to validate the admin session', { status: 503 });
    }

    context.set(Admin, { token, gql: createAdminGraphQLClient(token) }, { property: 'admin' });
    return next();
  };
}

const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);

function originHost(origin: string): string | null {
  if (origin === 'null') {
    return origin;
  }
  try {
    return new URL(origin).host;
  } catch {
    return null;
  }
}

/**
 * Rejects form posts from other sites: an unsafe request whose `Origin` doesn't match this
 * request's host gets a 400. Requests without an `Origin` header pass. On Railway the request
 * URL has the public host, because the server trusts the edge's forwarded headers.
 */
export function sameOrigin(): Middleware {
  return (context, next) => {
    if (safeMethods.has(context.request.method)) {
      return next();
    }
    const origin = context.request.headers.get('origin');
    if (origin !== null && originHost(origin) !== context.url.host) {
      return new Response('Bad Request', { status: 400 });
    }
    return next();
  };
}
