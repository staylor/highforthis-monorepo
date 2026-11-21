import type { Prisma } from '@prisma/client';

export type UserWithRoles = Prisma.UserGetPayload<{ include: { roles: true } }>;

export interface AppContext {
  authUser?: UserWithRoles;
}

/**
 * A record as its type's resolvers get it: `TIncluded` is the record with the relations its
 * queries include, which a record loaded by another query doesn't have.
 */
export type WithIncludes<TModel, TIncluded extends TModel> = TModel &
  Partial<Omit<TIncluded, keyof TModel>>;
