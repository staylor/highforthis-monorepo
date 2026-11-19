import { createFetchProxy } from 'remix/fetch-proxy';
import { openLazyFile } from 'remix/fs';
import { createFileResponse } from 'remix/response/file';
import { createContextKey, type Middleware, type RequestContext } from 'remix/router';

import { adminToken } from '../lib/adminSession.ts';
import { clientAddress } from '../lib/client.ts';
import { createGraphQLClient, graphqlHost, type GraphQLClient } from '../lib/graphql.ts';
import { getT, type TFunction } from '../lib/i18n.ts';
import { openObserveBundleFiles } from '../lib/openobserve-bundles.ts';
import { passkeyStarts } from '../lib/rate-limits.ts';

import { sameOrigin } from './admin.ts';

const wpPattern = /^\/(?:wp-|xmlrpc\.php|\.env)/i;

export function rejectWordPress(): Middleware {
  return (context, next) => {
    if (wpPattern.test(context.url.pathname)) {
      return new Response(null, { status: 403 });
    }
    return next();
  };
}

/** Serves the OpenObserve SDK bundles, and only those files, from their packages. */
export function openObserveBundles(): Middleware {
  return (context, next) => {
    const path = openObserveBundleFiles.get(context.url.pathname);
    const { method } = context.request;
    if (!path || (method !== 'GET' && method !== 'HEAD')) {
      return next();
    }
    return createFileResponse(openLazyFile(path), context.request, {
      cacheControl: 'public, max-age=31536000, immutable',
    });
  };
}

// Looked up per request rather than captured at startup, so tests can stub fetch.
const fetchNow: typeof fetch = (input, init) => globalThis.fetch(input, init);
const graphqlProxy = createFetchProxy(graphqlHost, { fetch: fetchNow });

const onlyPost = () =>
  new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
const checkOrigin = sameOrigin();

/**
 * The media upload page posts files from the browser, which can't read the httpOnly session
 * cookie, so the admin's token goes with them for GraphQL to check that the uploader is an admin.
 * Turning the cookie into a token is what a forged post from another site would want, so only
 * this site's own posts get it.
 */
function forwardUpload(context: RequestContext) {
  const { request } = context;
  if (request.method !== 'POST') {
    return onlyPost();
  }
  return checkOrigin(context, async () => {
    const token = await adminToken(request.headers.get('cookie'));
    if (!token) {
      return graphqlProxy(request);
    }
    const headers = new Headers(request.headers);
    headers.set('Authorization', `Bearer ${token}`);
    // A streamed body needs duplex: 'half' to be passed on
    return graphqlProxy(new Request(request, { headers, duplex: 'half' } as RequestInit));
  });
}

/**
 * Signing in with a passkey asks GraphQL for its options from the browser, so this stays on this
 * domain, which is the passkeys' origin. Each start saves a challenge, so each address gets a few.
 */
function forwardPasskeyStart({ request }: RequestContext) {
  if (request.method !== 'POST') {
    return onlyPost();
  }
  const address = clientAddress(request);
  if (address && !passkeyStarts.attempt(address)) {
    return Response.json(
      { error: 'Too many sign-in attempts. Try again in a few minutes.' },
      { status: 429, headers: { 'Retry-After': String(passkeyStarts.retryAfter(address)) } }
    );
  }
  return graphqlProxy(request);
}

// The only GraphQL paths the browser needs on this domain, besides the API itself
const exact: Record<string, (context: RequestContext) => Response | Promise<Response>> = {
  '/upload': forwardUpload,
  '/auth/passkeys/authenticate/options': forwardPasskeyStart,
};

const isGraphQL = (pathname: string) =>
  pathname === '/graphql' || pathname.startsWith('/graphql/') || pathname.startsWith('/graphql.');

export function proxies(): Middleware {
  return (context, next) => {
    const { pathname } = context.url;
    const forward = exact[pathname];
    if (forward) {
      return forward(context);
    }
    return isGraphQL(pathname) ? graphqlProxy(context.request) : next();
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
