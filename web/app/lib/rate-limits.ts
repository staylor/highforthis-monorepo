import { createRateLimiter } from '@highforthis/shared/rate-limit';

// Per client address, for the sign-in endpoints anyone can reach. GraphQL also limits failed
// password sign-ins per email, wherever they come from.
const fifteenMinutes = 15 * 60 * 1000;

/** Posts to the sign-in form, by password or passkey. */
export const signInAttempts = createRateLimiter({ limit: 10, windowMs: fifteenMinutes });

/** Passkey sign-ins started, each of which saves a challenge in GraphQL's database. */
export const passkeyStarts = createRateLimiter({ limit: 30, windowMs: fifteenMinutes });
