import 'dotenv/config';

import http from 'node:http';
import path from 'node:path';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

import compression from 'compression';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';

import { authMiddleware, jwtMiddleware, initialize } from './authentication';
import prisma from './database';
import cronJobs from './jobs';
import resolvers from './resolvers';
import typeDefs from './schema';
import { multerMiddleware, mediaMiddleware } from './uploads';

const GRAPHQL_PORT = process.env.GRAPHQL_PORT || 8080;

async function startServer(): Promise<void> {
  const context = { prisma };

  const app = express();
  const httpServer = http.createServer(app);

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
    req.context = context;

    next();
  });

  initialize(app);

  app.use('/graphql', jwtMiddleware);

  app.post('/auth', express.json(), authMiddleware);

  app.post('/upload', jwtMiddleware, multerMiddleware(uploadDir), mediaMiddleware);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await server.start();

  const graphqlMiddleware = expressMiddleware(server, {
    context: async ({ req }) => ({
      ...context,
      authUser: (req as any).context?.authUser,
    }),
  });

  app.use('/graphql', cors(), express.json(), graphqlMiddleware as any);

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: GRAPHQL_PORT }, () => {
      cronJobs(prisma);
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
