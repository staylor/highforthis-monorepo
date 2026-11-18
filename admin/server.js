import { startObservability } from '@highforthis/shared/observability';

try {
  startObservability({ serviceName: 'admin' });
  await import('./app.js');
} catch (error) {
  const { createLogger } = await import('@highforthis/shared/logger');
  const logger = createLogger({ serviceName: 'admin' });
  logger.fatal({ err: error }, 'Admin server failed to start');
  process.exitCode = 1;
}
