import http from 'node:http';

import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginCacheControlDisabled } from '@apollo/server/plugin/disabled';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { createRequestListener } from 'remix/node-fetch-server';

import { createHttpLogger, createLogger } from '@highforthis/shared/logger';

import { createApp, routes } from './app';
import env from './env';
import cronJobs from './jobs';
import type { AppContext } from './models';
import { isWordPressProbe } from './rejectWordPress';
import resolvers from './resolvers';
import typeDefs from './schema';

const GRAPHQL_PORT = env.GRAPHQL_PORT;
const logger = createLogger({ serviceName: 'graphql' });

// WordPress probes and the favicon are answered without being logged
function logged({ method, url = '/' }: http.IncomingMessage): boolean {
  let pathname: string;
  try {
    ({ pathname } = new URL(url, 'http://localhost'));
  } catch {
    return true;
  }
  const favicon = pathname === routes.favicon.href() && (method === 'GET' || method === 'HEAD');
  return !favicon && !isWordPressProbe(pathname);
}

async function startServer(): Promise<void> {
  const httpServer = http.createServer();

  const server = new ApolloServer<AppContext>({
    typeDefs,
    resolvers,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      // No type or field sets a cache hint, so every answer was "no-store" (createApp still
      // says so), and the plugin wrapped every field's resolver to find that out
      ApolloServerPluginCacheControlDisabled(),
    ],
  });
  await server.start();

  const httpLogger = createHttpLogger(logger);
  const listener = createRequestListener(createApp(server).fetch, {
    onError(error) {
      logger.error({ err: error }, 'Request failed');
      return new Response('Internal Server Error', { status: 500 });
    },
  });

  // pino-http works on Node's req/res, so it wraps the fetch listener instead of becoming
  // Remix middleware.
  httpServer.on('request', (req, res) => {
    if (logged(req)) {
      httpLogger(req, res);
    }
    listener(req, res);
  });

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: GRAPHQL_PORT }, () => {
      cronJobs();
      resolve();
    })
  );
  logger.info({ port: GRAPHQL_PORT }, 'GraphQL server ready');
}

await startServer();
