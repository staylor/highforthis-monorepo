import http from 'node:http';
import path from 'node:path';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';

import { authMiddleware, jwtMiddleware, initialize } from './authentication';
import database from './database';
import cronJobs from './jobs';
import addModelsToContext from './models';
import resolvers from './resolvers';
import typeDefs from './schema';
import { multerMiddleware, mediaMiddleware } from './uploads';

const GRAPHQL_PORT = process.env.GRAPHQL_PORT || 8080;

async function startServer(): Promise<void> {
  const { db } = await database();
  const context = addModelsToContext(db);

  const app = express();
  const httpServer = http.createServer(app);

  app.get('/favicon.ico', (_req, res) => res.status(204));

  app.use(compression());
  app.use(morgan('tiny'));
  // This server handles uploads, and can serve previews of static assets
  const uploadDir = path.join(process.cwd(), 'public/uploads');
  app.use(express.static(uploadDir));

  app.use(bodyParser.urlencoded({ extended: true }));

  app.use((req, _res, next) => {
    req.context = context;

    next();
  });

  initialize(app);

  app.use('/graphql', jwtMiddleware);

  app.post('/auth', bodyParser.json(), authMiddleware);

  app.post('/upload', jwtMiddleware, multerMiddleware(uploadDir), mediaMiddleware);

  const server = new ApolloServer({
    typeDefs: `#graphql
      ${typeDefs}
    `,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await server.start();

  app.use(
    cors(),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async () => context,
    })
  );

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: GRAPHQL_PORT }, () => {
      cronJobs(db);
      resolve();
    })
  );
  console.log(`🚀 Server ready at http://localhost:${GRAPHQL_PORT}`);
}

startServer()
  .then(() => {
    console.log('All systems go');
  })
  .catch((e) => {
    console.error('Uncaught error in startup');
    console.error(e);
    console.trace(e);
  });
