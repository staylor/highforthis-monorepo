import { startObservability } from '@highforthis/shared/observability';

try {
  startObservability({ serviceName: 'web' });
  await import('./app.js');
} catch (error) {
  const { createLogger } = await import('@highforthis/shared/logger');
  const logger = createLogger({ serviceName: 'web' });
  logger.fatal({ err: error }, 'Web server failed to start');
  process.exitCode = 1;
}
