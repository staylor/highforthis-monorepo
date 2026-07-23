import { startObservability } from '@highforthis/shared/observability';

try {
  startObservability({ serviceName: 'graphql' });
  await import('./server');
} catch (error) {
  const { createLogger } = await import('@highforthis/shared/logger');
  const logger = createLogger({ serviceName: 'graphql' });
  logger.fatal({ err: error }, 'GraphQL server failed to start');
  process.exitCode = 1;
}
