import { createFetchProxy } from 'remix/fetch-proxy';
import { createContextKey, type Middleware } from 'remix/router';

import { createGraphQLClient, graphqlHost, type GraphQLClient } from '../lib/graphql.ts';
import { getT, type TFunction } from '../lib/i18n.ts';

const wpPattern = /^\/(?:wp-|xmlrpc\.php|\.env)/i;

export function rejectWordPress(): Middleware {
  return (context, next) => {
    if (wpPattern.test(context.url.pathname)) {
      return new Response(null, { status: 403 });
    }
    return next();
  };
}

// The admin is its own app (admin/). Forwarding its paths keeps it on this domain, so the
// session cookie, passkeys and signed-in live refresh on public pages keep working.
const adminHost = (process.env.ADMIN_HOST || 'http://localhost:3001').replace(/\/$/, '');
// Looked up per request rather than captured at startup, so tests can stub fetch.
const fetchNow: typeof fetch = (input, init) => globalThis.fetch(input, init);
const forwards = [
  {
    paths: ['/admin', '/auth/passkeys', '/login', '/modals', '/upload'],
    proxy: createFetchProxy(adminHost, { fetch: fetchNow, xForwardedHeaders: true }),
  },
  { paths: ['/graphql', '/uploads'], proxy: createFetchProxy(graphqlHost, { fetch: fetchNow }) },
];

const matches = (pathname: string, path: string) =>
  pathname === path || pathname.startsWith(`${path}/`) || pathname.startsWith(`${path}.`);

export function proxies(): Middleware {
  return (context, next) => {
    const { pathname } = context.url;
    const forward = forwards.find(({ paths }) => paths.some((path) => matches(pathname, path)));
    return forward ? forward.proxy(context.request) : next();
  };
}

export const GraphQL = createContextKey<GraphQLClient>();
export const Translate = createContextKey<TFunction>();

/** The translation function as `context.t`. The locale is fixed to English. */
export function translations(): Middleware<{
  key: typeof Translate;
  value: TFunction;
  property: 't';
}> {
  return (context, next) => {
    context.set(Translate, getT(), { property: 't' });
    return next();
  };
}

/** A GraphQL client for the request, as `context.gql`. */
export function graphql(): Middleware<{
  key: typeof GraphQL;
  value: GraphQLClient;
  property: 'gql';
}> {
  return (context, next) => {
    context.set(GraphQL, createGraphQLClient(), { property: 'gql' });
    return next();
  };
}
