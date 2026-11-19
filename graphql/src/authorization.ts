import { GraphQLError } from 'graphql';
import type { Middleware } from 'remix/router';

import { AuthUser } from '#/http';
import type { AppContext, UserWithRoles } from '#/models';

export function isAdmin(user?: UserWithRoles | null): user is UserWithRoles {
  return Boolean(user?.roles.some((role) => role.name === 'admin'));
}

export type Resolver = (
  parent: unknown,
  args: unknown,
  context: AppContext,
  info: unknown
) => unknown;

export function requireAdmin(resolver: Resolver): Resolver {
  return (parent, args, context, info) => {
    if (!isAdmin(context.authUser)) {
      throw new GraphQLError('Admin access required', {
        extensions: { code: context.authUser ? 'FORBIDDEN' : 'UNAUTHENTICATED' },
      });
    }
    return resolver(parent, args, context, info);
  };
}

/** Answers 401 unless `jwt()` found an admin. */
export function adminOnly(): Middleware {
  return (context, next) => {
    if (!isAdmin(context.get(AuthUser))) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }
    return next();
  };
}
