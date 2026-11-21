import { createMultiMatcher, type MultiMatcher } from 'remix/route-pattern/match';
import type { MatchData, Middleware } from 'remix/router';

import { nameRequestSpan } from '@highforthis/shared/observability';

/**
 * The router's matcher, which starts every route's middleware by naming the request's span after
 * the route's pattern, such as `GET /shows/:id`. It comes first because the route's own middleware
 * may answer without reaching the action, as when an admin page sends someone to sign in.
 */
export function tracedMatcher(name = nameRequestSpan): MultiMatcher<MatchData> {
  const matcher = createMultiMatcher<MatchData>();
  return {
    get ignoreCase() {
      return matcher.ignoreCase;
    },
    add(pattern, entry) {
      const route = entry.pattern.source;
      const nameSpan: Middleware = (context, next) => {
        name(context.method, route);
        return next();
      };
      matcher.add(pattern, { ...entry, middleware: [nameSpan, ...(entry.middleware ?? [])] });
    },
    match: (url, options) => matcher.match(url, options),
    matchAll: (url, options) => matcher.matchAll(url, options),
  };
}
