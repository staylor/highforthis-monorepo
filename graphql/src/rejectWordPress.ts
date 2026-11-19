import type { Middleware } from 'remix/router';

const wpPattern = /^\/(?:wp-|xmlrpc\.php|\.env)/i;

export const isWordPressProbe = (pathname: string) => wpPattern.test(pathname);

export default function rejectWordPress(): Middleware {
  return (context, next) => {
    if (isWordPressProbe(context.url.pathname)) {
      return new Response(null, { status: 403 });
    }
    return next();
  };
}
