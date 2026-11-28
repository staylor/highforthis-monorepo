// Railway runs this before it starts a new web deployment (railway.toml's preDeployCommand). A
// merge that changes web and GraphQL deploys both at once, and GraphQL, which migrates the
// database first, can be the later of the two. Live before it, web would ask the GraphQL that's
// still running for fields it doesn't have, and those pages would fail. So this waits until
// GraphQL answers what this build asks for. If it doesn't in time, the deploy fails and the web
// that's live stays: deploy web again once GraphQL is.
import { apiReady } from './app/lib/api-ready.ts';
import { graphqlHost } from './app/lib/graphql.ts';
import { logger } from './app/lib/logger.ts';

try {
  await apiReady({
    onWait: (reason) => logger.info({ graphqlHost, reason }, 'Waiting for GraphQL'),
  });
  logger.info({ graphqlHost }, 'GraphQL answers what this build asks for');
} catch (error) {
  logger.fatal({ err: error, graphqlHost }, 'Gave up waiting for GraphQL');
  process.exitCode = 1;
}
