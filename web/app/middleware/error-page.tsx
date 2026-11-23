import type { Middleware } from 'remix/router';

import { renderNotFound, renderPage } from '#/actions/render-page.tsx';
import { GraphQLRequestError } from '#/lib/graphql.ts';
import { logger } from '#/lib/logger.ts';
import type { AppContext } from '#/router.ts';

/** A page asked GraphQL for something that can't exist, such as a page of results past the end. */
const askedForNothing = (request: Request, error: unknown) =>
  request.method === 'GET' && error instanceof GraphQLRequestError && error.invalid !== undefined;

/**
 * An action's uncaught error, logged and answered with a 500 page in the site's plain layout. The
 * page doesn't show the error itself. A page whose query GraphQL turned down as the request's
 * mistake gets the 404 page instead. This goes after render(), so context.render() exists. If the
 * error page fails too, the error goes on to the server's onError, which answers in plain text.
 */
export function errorPage(): Middleware {
  return async (context, next) => {
    try {
      return await next();
    } catch (error) {
      if (context.request.signal.aborted) {
        throw error;
      }
      const app = context as unknown as AppContext;
      try {
        if (askedForNothing(context.request, error)) {
          return await renderNotFound(app);
        }
        logger.error({ err: error, path: context.url.pathname }, 'Request failed');
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
