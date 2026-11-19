import type { Middleware } from 'remix/router';

// Sent with every response, unless it already sets its own. The policy doesn't limit scripts
// yet, which would need a nonce for the inline ones; it stops other sites framing pages, a
// <base> tag redirecting relative URLs, plugins, and forms posting anywhere but this site.
const contentSecurityPolicy = [
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
].join('; ');

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
