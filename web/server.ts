import * as http from 'node:http';

import { createRequestListener, type ClientAddress } from 'remix/node-fetch-server';

import { createHttpLogger } from '@highforthis/shared/logger';
import { startObservability } from '@highforthis/shared/observability';

startObservability({ serviceName: 'web' });

const { assertSessionSecret } = await import('./app/lib/adminSession.ts');
assertSessionSecret();
const { assets } = await import('./app/assets.ts');
const { router } = await import('./app/router.ts');
const { rememberClientAddress } = await import('./app/lib/client.ts');
const { logger } = await import('./app/lib/logger.ts');

const httpLogger = createHttpLogger(logger);

const port = Number.parseInt(process.env.PORT || process.env.SERVER_PORT || '3000', 10);
const hmrProxyPort = process.env.HMR_PROXY_PORT
  ? Number.parseInt(process.env.HMR_PROXY_PORT, 10)
  : null;
const isHmr = process.env.REMIX_NODE_HMR === '1';
// On Railway, requests arrive through its edge, which terminates HTTPS and replaces any
// X-Forwarded-Proto, -Host and -For the client sent. Trusting them gives requests their
// https:// URL, which keeps redirects on https and lets the admin's form posts pass sameOrigin().
const behindRailway = Boolean(process.env.RAILWAY_ENVIRONMENT_NAME);

// The router doesn't see the client's address, so it's kept beside the request for the sign-in
// rate limits.
const listener = createRequestListener(
  (request: Request, client: ClientAddress) => {
    rememberClientAddress(request, client.address);
    return router.fetch(request);
  },
  {
    trustProxy: isHmr || behindRailway,
    onError(error) {
      logger.error({ err: error }, 'Request failed');
      return new Response('Internal Server Error', { status: 500 });
    },
  }
);

// pino-http works on Node's req/res, so it wraps the fetch listener instead of
// becoming Remix middleware.
const server = http.createServer((req, res) => {
  httpLogger(req, res);
  listener(req, res);
});

server.listen(port, () => {
  if (isHmr) {
    import('remix/node-hmr/runtime')
      .then((nodeHmr) => nodeHmr.emitServerReady())
      .catch((error) => logger.error({ err: error }, 'HMR runtime failed to load'));
  }
  logger.info({ port: hmrProxyPort ?? port }, 'Web server ready');
});

let shuttingDown = false;

function shutdown() {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  server.close(() => assets.close().finally(() => process.exit(0)));
  server.closeAllConnections();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
