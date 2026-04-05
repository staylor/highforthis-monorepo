import type { Prisma } from '@prisma/client';

type UserWithRoles = Prisma.UserGetPayload<{ include: { roles: true } }>;

export interface AppContext {
  authUser?: UserWithRoles;
}
