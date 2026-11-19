// Counts attempts per key, such as a client's address or an email, in fixed windows. The counts
// live in this process's memory, which is enough for one instance of each service.

interface Window {
  count: number;
  resetAt: number;
}

export interface RateLimiter {
  /** Records an attempt for `key`. False once `key` has used up its attempts in this window. */
  attempt(key: string): boolean;
  /** Whether `key` has used up its attempts, without recording one. */
  isLimited(key: string): boolean;
  /** Whole seconds until `key` can try again: 0 when it isn't limited. */
  retryAfter(key: string): number;
  /** Forgets `key`'s attempts, as after a successful sign-in. */
  reset(key: string): void;
}

interface RateLimiterOptions {
  /** Attempts allowed per window. */
  limit: number;
  windowMs: number;
  /** Keys kept at most. Past this, expired windows go first, then the oldest. */
  maxKeys?: number;
  now?: () => number;
}

export function createRateLimiter({
  limit,
  windowMs,
  maxKeys = 10_000,
  now = Date.now,
}: RateLimiterOptions): RateLimiter {
  const windows = new Map<string, Window>();

  function current(key: string): Window | undefined {
    const window = windows.get(key);
    if (window && window.resetAt <= now()) {
      windows.delete(key);
      return undefined;
    }
    return window;
  }

  function prune() {
    const time = now();
    for (const [key, window] of windows) {
      if (window.resetAt <= time) {
        windows.delete(key);
      }
    }
    // Maps iterate in insertion order, so the first keys are the oldest
    for (const key of windows.keys()) {
      if (windows.size <= maxKeys) {
        break;
      }
      windows.delete(key);
    }
  }

  return {
    attempt(key) {
      let window = current(key);
      if (!window) {
        window = { count: 0, resetAt: now() + windowMs };
        windows.set(key, window);
        if (windows.size > maxKeys) {
          prune();
        }
      }
      window.count += 1;
      return window.count <= limit;
    },
    isLimited(key) {
      const window = current(key);
      return window !== undefined && window.count >= limit;
    },
    retryAfter(key) {
      const window = current(key);
      if (!window || window.count < limit) {
        return 0;
      }
      return Math.ceil((window.resetAt - now()) / 1000);
    },
    reset(key) {
      windows.delete(key);
    },
  };
}
