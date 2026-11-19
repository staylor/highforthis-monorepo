import { createRequestHandler } from '@react-router/express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { RouterContextProvider } from 'react-router';

import { createHttpLogger, createLogger } from '@highforthis/shared/logger';

import factory from './src/apollo/client.js';
import { apolloClientContext, graphqlHostContext, i18nContext } from './src/context.js';
import createI18n from './src/i18n.js';

// The admin app: /admin and /login. The public site forwards those paths here,
// so both share one domain, session cookie and passkey origin.

process.env.TZ = 'America/New_York';

// Matches the Vite base: the app's scripts, styles and public files are served under it
const BASE = '/admin';
const serverPort = parseInt(process.env.PORT || process.env.ADMIN_PORT || '3001', 10);
const logger = createLogger({ serviceName: 'admin' });

// use a local GQL server by default; accept either a base URL or a legacy /graphql URL
const configuredGqlHost = process.env.GQL_HOST || 'http://localhost:8081';
const gqlHost = configuredGqlHost.replace(/\/graphql\/?$/, '').replace(/\/$/, '');
const getClient = factory(`${gqlHost}/graphql`);

function getLoadContext(_, res) {
  const context = new RouterContextProvider();
  context.set(i18nContext, res.locals.i18n);
  context.set(apolloClientContext, getClient());
  context.set(graphqlHostContext, gqlHost);
  return context;
}

const proxy = createProxyMiddleware({
  target: gqlHost,
  changeOrigin: true,
  // The media upload page moved to web, which forwards /upload to GraphQL itself
  pathFilter: ['/auth/passkeys', '/graphql', '/uploads'],
});

const viteDevServer =
  process.env.NODE_ENV === 'production'
    ? undefined
    : await import('vite').then((vite) =>
        vite.createServer({
          server: {
            middlewareMode: true,
            // The public site's dev server uses Vite's default HMR port
            hmr: { port: parseInt(process.env.ADMIN_HMR_PORT || '24679', 10) },
          },
        })
      );

const reactRouterHandler = createRequestHandler({
  build: viteDevServer
    ? () => viteDevServer.ssrLoadModule('virtual:react-router/server-build')
    : await import('./build/server/index.js'),
  getLoadContext,
});

const app = express();

// The public site's server forwards admin paths here and says which host the browser asked
// for in X-Forwarded-Host. Trusting it gives requests their public URL, which React Router
// compares with the Origin header to reject cross-site form posts. Only loopback and private
// network addresses are trusted: web reaches admin over those, and admin has no public domain.
app.set('trust proxy', ['loopback', 'uniquelocal']);

// @react-router/express takes the port from the Host header when X-Forwarded-Host has none,
// so highforthis.com became highforthis.com:3001 and still failed that check. Use the
// forwarded host as the Host when Express trusted it, which is when req.hostname came from it.
app.use((req, _res, next) => {
  const forwardedHost = req.get('x-forwarded-host')?.split(',')[0].trim();
  const forwardedUrl = forwardedHost && URL.parse(`http://${forwardedHost}`);
  if (forwardedUrl && forwardedUrl.hostname === req.hostname) {
    req.headers.host = forwardedHost;
  }
  next();
});

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
    `${BASE}/assets`,
    express.static('build/client/assets', {
      immutable: true,
      maxAge: '1y',
    })
  );
  // Everything else in public/ (translations, editor icons, favicon). Without
  // redirect: false, a request for /admin would be redirected to /admin/ as a folder.
  app.use(BASE, express.static('build/client', { maxAge: '1h', index: false, redirect: false }));
}

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
  logger.info({ port: serverPort }, 'Admin server ready');
});
