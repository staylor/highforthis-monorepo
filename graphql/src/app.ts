import { HeaderMap, type ApolloServer } from '@apollo/server';
import { compression } from 'remix/middleware/compression';
import { cors } from 'remix/middleware/cors';
import { staticFiles } from 'remix/middleware/static';
import { createRouter } from 'remix/router';
import { del, get, post, route } from 'remix/routes';

import { authHandler, jwt, sessionHandler } from './authentication';
import { adminOnly } from './authorization';
import { parseBody } from './http';
import type { AppContext, UserWithRoles } from './models';
import {
  authenticationOptionsHandler,
  authenticationVerificationHandler,
  deletePasskeyHandler,
  listPasskeysHandler,
  registrationOptionsHandler,
  registrationVerificationHandler,
} from './passkeys';
import rejectWordPress from './rejectWordPress';
import { uploadDir, uploadHandler } from './uploads';

export const routes = route({
  favicon: get('/favicon.ico'),
  health: get('/health'),
  graphql: '/graphql',
  auth: post('/auth'),
  session: get('/auth/session'),
  passkeys: route('/auth/passkeys', {
    list: get('/'),
    authenticationOptions: post('/authenticate/options'),
    authenticationVerification: post('/authenticate/verify'),
    registrationOptions: post('/register/options'),
    registrationVerification: post('/register/verify'),
    remove: del('/:credentialId'),
  }),
  upload: post('/upload'),
});

// Like express.static, which served the uploads before, don't serve dotfiles
const notDotfile = (path: string) => !path.split('/').some((segment) => segment.startsWith('.'));

/** Runs a GraphQL request through Apollo Server. */
function graphqlHandler(server: ApolloServer<AppContext>) {
  return async ({
    request,
    url,
    authUser,
    body,
  }: {
    request: Request;
    url: URL;
    authUser: UserWithRoles | null;
    body: unknown;
  }) => {
    const headers = new HeaderMap();
    for (const [key, value] of request.headers) {
      headers.set(key, value);
    }

    const httpGraphQLResponse = await server.executeHTTPGraphQLRequest({
      httpGraphQLRequest: {
        method: request.method.toUpperCase(),
        headers,
        search: url.search,
        body,
      },
      context: async (): Promise<AppContext> => ({ authUser: authUser ?? undefined }),
    });

    const init = {
      status: httpGraphQLResponse.status || 200,
      headers: [...httpGraphQLResponse.headers],
    };
    if (httpGraphQLResponse.body.kind === 'complete') {
      return new Response(httpGraphQLResponse.body.string, init);
    }
    // Incremental delivery, such as @defer, sends the result in chunks
    const chunks = httpGraphQLResponse.body.asyncIterator;
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async pull(controller) {
        const { done, value } = await chunks.next();
        if (done) {
          controller.close();
        } else {
          controller.enqueue(encoder.encode(value));
        }
      },
      async cancel() {
        await chunks.return?.();
      },
    });
    return new Response(stream, init);
  };
}

/** The routes GraphQL serves over HTTP, with Apollo Server answering `/graphql`. */
export function createApp(server: ApolloServer<AppContext>) {
  const router = createRouter({
    middleware: [
      rejectWordPress(),
      compression(),
      // This server handles uploads, and can serve previews of them
      staticFiles(uploadDir, { cacheControl: 'public, max-age=0', filter: notDotfile }),
    ],
  });

  router.map(routes.favicon, () => new Response(null, { status: 204 }));
  router.map(routes.health, () => Response.json({ status: 'ok' }));

  router.map(routes.graphql, {
    middleware: [jwt(), cors(), parseBody()],
    handler: graphqlHandler(server),
  });

  router.map(routes.passkeys, {
    middleware: [jwt(), parseBody()],
    actions: {
      list: listPasskeysHandler,
      authenticationOptions: authenticationOptionsHandler,
      authenticationVerification: authenticationVerificationHandler,
      registrationOptions: registrationOptionsHandler,
      registrationVerification: registrationVerificationHandler,
      remove: deletePasskeyHandler,
    },
  });
  router.map(routes.session, { middleware: [jwt()], handler: sessionHandler });
  router.map(routes.auth, { middleware: [parseBody()], handler: authHandler });

  router.map(routes.upload, { middleware: [jwt(), adminOnly()], handler: uploadHandler });

  return router;
}
