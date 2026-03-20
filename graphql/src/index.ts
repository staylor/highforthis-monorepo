import http from 'node:http';
import path from 'node:path';

import { ApolloServer, HeaderMap } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';

import { authMiddleware, jwtMiddleware } from './authentication';
import cronJobs from './jobs';
import type { AppContext } from './models';
import rejectWordPress from './rejectWordPress';
import resolvers from './resolvers';
import typeDefs from './schema';
import { multerMiddleware, mediaMiddleware } from './uploads';

const GRAPHQL_PORT = process.env.GRAPHQL_PORT || 8080;

async function startServer(): Promise<void> {
  const app = express();
  const httpServer = http.createServer(app);

  app.use(rejectWordPress);

  app.get('/favicon.ico', (_req, res) => {
    res.sendStatus(204);
  });

  app.use(compression());
  app.use(morgan('tiny'));
  // This server handles uploads, and can serve previews of static assets
  const uploadDir = path.join(process.cwd(), 'public/uploads');
  app.use(express.static(uploadDir));

  app.use(express.urlencoded({ extended: true }));

  app.use((req, _res, next) => {
    req.context = {};

    next();
  });

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/graphql', jwtMiddleware);

  app.post('/auth', express.json(), authMiddleware);

  app.post('/upload', jwtMiddleware, multerMiddleware(uploadDir), mediaMiddleware);

  const server = new ApolloServer<AppContext>({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await server.start();

  app.use('/graphql', cors(), express.json(), async (req, res) => {
    const headers = new HeaderMap();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined) {
        headers.set(key, Array.isArray(value) ? value.join(', ') : value);
      }
    }

    const httpGraphQLResponse = await server.executeHTTPGraphQLRequest({
      httpGraphQLRequest: {
        method: req.method.toUpperCase(),
        headers,
        search: new URL(req.url, `http://${req.headers.host}`).search ?? '',
        body: req.body,
      },
      context: async () => ({
        authUser: (req as any).context?.authUser,
      }),
    });

    for (const [key, value] of httpGraphQLResponse.headers) {
      res.setHeader(key, value);
    }
    res.status(httpGraphQLResponse.status || 200);

    if (httpGraphQLResponse.body.kind === 'complete') {
      res.send(httpGraphQLResponse.body.string);
      return;
    }

    for await (const chunk of httpGraphQLResponse.body.asyncIterator) {
      res.write(chunk);
    }
    res.end();
  });

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: GRAPHQL_PORT }, () => {
      cronJobs();
      resolve();
    })
  );
  console.log(`🚀 Server ready at http://localhost:${GRAPHQL_PORT}`);
}

try {
  await startServer();
  console.log('All systems go');
} catch (e) {
  console.error('Uncaught error in startup');
  console.error(e);
  console.trace(e);
}
