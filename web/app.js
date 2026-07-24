import { createHttpLogger, createLogger } from '@highforthis/shared/logger';
import { createRequestHandler } from '@react-router/express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

import factory from './apollo/client.js';
import rejectWordPress from './rejectWordPress.js';
import createI18n from './src/i18n.js';

process.env.TZ = 'America/New_York';

const serverPort = parseInt(process.env.PORT || process.env.SERVER_PORT || '3000', 10);
const logger = createLogger({ serviceName: 'web' });

// use a local GQL server by default; accept either a base URL or a legacy /graphql URL
const configuredGqlHost = process.env.GQL_HOST || 'http://localhost:8080';
const gqlHost = configuredGqlHost.replace(/\/graphql\/?$/, '').replace(/\/$/, '');
const getClient = factory(`${gqlHost}/graphql`);

function getLoadContext(_, res) {
  return {
    i18n: res.locals.i18n,
    apolloClient: getClient(),
    graphqlHost: gqlHost,
  };
}

const proxy = createProxyMiddleware({
  target: gqlHost,
  changeOrigin: true,
  pathFilter: ['/auth/passkeys', '/graphql', '/upload', '/uploads'],
});

const viteDevServer =
  process.env.NODE_ENV === 'production'
    ? undefined
    : await import('vite').then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        })
      );

const reactRouterHandler = createRequestHandler({
  build: viteDevServer
    ? () => viteDevServer.ssrLoadModule('virtual:react-router/server-build')
    : await import('./build/server/index.js'),
  getLoadContext,
});

const app = express();

app.use(rejectWordPress);
app.use(compression());
app.use(createHttpLogger(logger));
app.use(cookieParser());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable('x-powered-by');

// Proxy API requests before Vite's development middleware can serve an HTML fallback.
app.use(proxy);

// handle asset requests
if (viteDevServer) {
  app.use(viteDevServer.middlewares);
} else {
  app.use(
    '/assets',
    express.static('build/client/assets', {
      immutable: true,
      maxAge: '1y',
    })
  );
}
// Remix fingerprints its assets so we can cache forever.
app.use('/build', express.static('public/build', { immutable: true, maxAge: '1y' }));

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static('build/client', { maxAge: '1h' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// handle SSR requests
app.all('/{*splat}', async (_, res, next) => {
  // determine locale here
  res.locals.i18n = await createI18n('en');
  next();
});
app.all('/{*splat}', reactRouterHandler);

app.listen(serverPort, () => {
  logger.info({ port: serverPort }, 'Web server ready');
});
