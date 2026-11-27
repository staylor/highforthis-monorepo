import { createRateLimiter } from '@highforthis/shared/rate-limit';

// Per client address, for the sign-in form anyone can post. GraphQL also limits password sign-ins
// per email, wherever they come from.
const fifteenMinutes = 15 * 60 * 1000;

// The end-to-end tests sign in many times from one address, so they turn this off
const limit = (count: number) => (process.env.SIGN_IN_RATE_LIMITS === 'off' ? Infinity : count);

/** Posts to the sign-in form, by password or passkey. */
export const signInAttempts = createRateLimiter({ limit: limit(10), windowMs: fifteenMinutes });
