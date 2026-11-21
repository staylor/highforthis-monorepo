import { GraphQLError, type GraphQLResolveInfo } from 'graphql';
import type { Middleware } from 'remix/router';

import { AuthUser } from '#/http';
import type { AppContext, UserWithRoles } from '#/models';

export function isAdmin(user?: UserWithRoles | null): user is UserWithRoles {
  return Boolean(user?.roles.some((role) => role.name === 'admin'));
}

/** Any field's resolver, as far as requireAdmin can tell */
export type AnyResolver = (
  parent: never,
  args: never,
  context: AppContext,
  info: GraphQLResolveInfo
) => unknown;

/** The resolver, for admins only: anyone else gets an error */
export function requireAdmin<TResolver extends AnyResolver>(resolver: TResolver): TResolver {
  const guarded: AnyResolver = (parent, args, context, info) => {
    if (!isAdmin(context.authUser)) {
      throw new GraphQLError('Admin access required', {
        extensions: { code: context.authUser ? 'FORBIDDEN' : 'UNAUTHENTICATED' },
      });
    }
    return resolver(parent, args, context, info);
  };
  // It takes what the resolver takes, and answers what it answers
  return guarded as TResolver;
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
