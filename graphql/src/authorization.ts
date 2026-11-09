import type { NextFunction, Request, Response } from 'express';
import { GraphQLError } from 'graphql';

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

export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!isAdmin(req.context?.authUser as UserWithRoles | undefined)) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  next();
}
