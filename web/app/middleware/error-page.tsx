import type { Middleware } from 'remix/router';

import { createLogger } from '@highforthis/shared/logger';

import { renderPage } from '../actions/render-page.tsx';
import type { AppContext } from '../router.ts';

const logger = createLogger({ serviceName: 'web' });

/**
 * An action's uncaught error, logged and answered with a 500 page in the site's plain layout, as
 * React Router's root ErrorBoundary rendered one. The page doesn't show the error itself. It goes
 * after render(), so context.render() exists. If the error page fails too, the error goes on to
 * the server's onError, which answers in plain text.
 */
export function errorPage(): Middleware {
  return async (context, next) => {
    try {
      return await next();
    } catch (error) {
      if (context.request.signal.aborted) {
        throw error;
      }
      logger.error({ err: error, path: context.url.pathname }, 'Request failed');
      const app = context as unknown as AppContext;
      try {
        return await renderPage(app, <pre>{app.t('error.message')}</pre>, {
          title: app.t('error.title'),
          layout: 'bare',
          status: 500,
        });
      } catch {
        throw error;
      }
    }
  };
}
