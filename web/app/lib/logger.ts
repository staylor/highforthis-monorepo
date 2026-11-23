import { createLogger } from '@highforthis/shared/logger';

/**
 * The server's logger. Its records go to OpenObserve with the request's trace, which what's
 * written to the console doesn't.
 */
export const logger = createLogger({ serviceName: 'web' });
