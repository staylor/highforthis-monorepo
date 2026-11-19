import { createContextKey, type Middleware } from 'remix/router';

import { adminToken } from '../lib/adminSession.ts';

// Any middleware, whatever it adds to the context
type AnyMiddleware = Middleware<any>;

interface Timing {
  name: string;
  duration: number;
}

const Timings = createContextKey<Timing[]>();

/**
 * In production the breakdown is for signed-in admins: it names the app's middleware and shows
 * how long each step, such as checking a password, took.
 */
async function showTimings(request: Request): Promise<boolean> {
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }
  return (await adminToken(request.headers.get('cookie'))) !== null;
}

/**
 * Reports where each request's time went in a `Server-Timing` header, which browsers show in
 * the network panel. Each middleware wrapped with `timed()` reports its own time, without the
 * middleware after it, and `route` is what's left: the route's middleware and action.
 */
export function serverTiming(): Middleware {
  return async (context, next) => {
    const start = performance.now();
    const timings: Timing[] = [];
    context.set(Timings, timings);
    const response = await next();
    if (!(await showTimings(context.request))) {
      return response;
    }
    const total = performance.now() - start;
    const measured = timings.reduce((sum, { duration }) => sum + duration, 0);
    const value = [
      ...timings,
      { name: 'route', duration: total - measured },
      { name: 'total', duration: total },
    ]
      .map(({ name, duration }) => `${name};dur=${duration.toFixed(2)}`)
      .join(', ');
    try {
      response.headers.append('Server-Timing', value);
      return response;
    } catch {
      // Proxied responses have immutable headers
      const copy = new Response(response.body, response);
      copy.headers.append('Server-Timing', value);
      return copy;
    }
  };
}

/** Wraps a middleware to report its own time, without the middleware after it, as `name`. */
export function timed<M extends AnyMiddleware>(name: string, middleware: M): M {
  const wrapped: AnyMiddleware = async (context, next) => {
    const timings = context.get(Timings);
    if (!timings) {
      return middleware(context, next);
    }
    const start = performance.now();
    let downstream = 0;
    const timedNext = async () => {
      const nextStart = performance.now();
      try {
        return await next();
      } finally {
        downstream = performance.now() - nextStart;
      }
    };
    try {
      return await middleware(context, timedNext);
    } finally {
      timings.push({ name, duration: performance.now() - start - downstream });
    }
  };
  return wrapped as M;
}
