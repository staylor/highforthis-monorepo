import { csp, getCspNonce } from 'remix/middleware/csp';
import { createContextKey, type Middleware } from 'remix/router';

// Every response's policy: it stops other sites framing pages, a <base> tag redirecting relative
// URLs, plugins, and forms posting anywhere but this site.
const directives = {
  frameAncestors: ["'self'"],
  baseUri: ["'self'"],
  objectSrc: ["'none'"],
  formAction: ["'self'"],
};

/**
 * A page's policy, which also says where its scripts may come from: this site, and the inline
 * ones that carry the response's nonce, which Document gives its own and Remix gives the import
 * map. Markup that gets into a page some other way can't run a script. `blob:` is for scripts the
 * page's own scripts make: Remix loads modules that way where a browser can't add to its import
 * map, and the RUM SDK starts its session replay worker that way. It goes before render(), which
 * gets the nonce from it.
 */
export function pagePolicy() {
  return csp({
    policy: ({ nonce }) => ({
      ...directives,
      scriptSrc: ["'self'", `'nonce-${nonce}'`, 'blob:'],
      workerSrc: ["'self'", 'blob:'],
    }),
  });
}

const Nonce = createContextKey<string | undefined>();

/** The page policy's nonce as `context.nonce`, for the inline scripts a page writes itself. */
export function pageNonce(): Middleware<{
  key: typeof Nonce;
  value: string | undefined;
  property: 'nonce';
}> {
  return (context, next) => {
    context.set(Nonce, getCspNonce(context), { property: 'nonce' });
    return next();
  };
}

const contentSecurityPolicy = [
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
].join('; ');

// Sent with every response, unless it already sets its own, as a page does its policy
const always: Record<string, string> = {
  'Content-Security-Policy': contentSecurityPolicy,
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

// A year of HTTPS only, sent over HTTPS (on Railway the request URL is https:// from the edge's
// forwarded headers). Not includeSubDomains, which would cover hosts this app doesn't serve.
const hsts = 'max-age=31536000';

/** Adds the security headers to every response. */
export function securityHeaders(): Middleware {
  return async (context, next) => {
    const response = await next();
    const headers: Record<string, string> = { ...always };
    if (context.url.protocol === 'https:') {
      headers['Strict-Transport-Security'] = hsts;
    }
    const missing = Object.entries(headers).filter(([name]) => !response.headers.has(name));
    if (missing.length === 0) {
      return response;
    }
    try {
      for (const [name, value] of missing) {
        response.headers.set(name, value);
      }
      return response;
    } catch {
      // Proxied responses have immutable headers
      const copy = new Response(response.body, response);
      for (const [name, value] of missing) {
        copy.headers.set(name, value);
      }
      return copy;
    }
  };
}
