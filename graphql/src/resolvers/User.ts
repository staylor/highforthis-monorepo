import bcrypt from 'bcryptjs';
import type {
  MutationCreateUserArgs,
  MutationRemoveUserArgs,
  MutationUpdateUserArgs,
  QueryUserArgs,
  QueryUsersArgs,
} from 'types/graphql';

import type { AppContext } from '~/models';

import { parseConnection } from './utils/collection';

const SALT_ROUNDS = 10;

const userIncludes = { roles: true };

const resolvers = {
  User: {
    roles(user: any, _: unknown, { prisma }: AppContext) {
      if ('roles' in user && Array.isArray(user.roles)) {
        return user.roles.map((r: any) => r.name || r);
      }
      return prisma.userRole
        .findMany({ where: { userId: user.id } })
        .then((records: any[]) => records.map((r) => r.name));
    },
  },
  Query: {
    async users(_: unknown, args: QueryUsersArgs, { prisma }: AppContext) {
      const { search, ...connectionArgs } = args;
      const where: any = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { bio: { contains: search, mode: 'insensitive' } },
        ];
      }
      return parseConnection(prisma.user, connectionArgs, {
        where,
        orderBy: { name: 'asc' },
        include: userIncludes,
      });
    },

    user(_: unknown, { id }: QueryUserArgs, { prisma }: AppContext) {
      return prisma.user.findUnique({ where: { id }, include: userIncludes });
    },
  },
  Mutation: {
    async createUser(_: unknown, { input }: MutationCreateUserArgs, { prisma }: AppContext) {
      const { password, roles, ...fields } = input as any;
      if (!fields.email || !password) {
        throw new Error('Email and Password are required.');
      }
      const exists = await prisma.user.count({ where: { email: fields.email } });
      if (exists) {
        throw new Error('Email already exists.');
      }
      const hash = await bcrypt.hash(password, SALT_ROUNDS);
      return prisma.user.create({
        data: {
          ...fields,
          hash,
          roles: roles?.length ? { create: roles.map((name: string) => ({ name })) } : undefined,
        },
        include: userIncludes,
      });
    },

    async updateUser(_: unknown, { id, input }: MutationUpdateUserArgs, { prisma }: AppContext) {
      const { password, roles, ...fields } = input as any;
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) throw new Error('User not found');

      if (fields.email && fields.email !== user.email) {
        const exists = await prisma.user.count({ where: { email: fields.email } });
        if (exists) {
          throw new Error('Email already exists.');
        }
      }

      const data: any = { ...fields };
      if (password) {
        data.hash = await bcrypt.hash(password, SALT_ROUNDS);
      }

      if (typeof roles !== 'undefined') {
        await prisma.userRole.deleteMany({ where: { userId: id } });
        if (roles?.length) {
          await prisma.userRole.createMany({
            data: roles.map((name: string) => ({ userId: id, name })),
          });
        }
      }

      return prisma.user.update({ where: { id }, data, include: userIncludes });
    },

    async removeUser(_: unknown, { ids }: MutationRemoveUserArgs, { prisma }: AppContext) {
      try {
        await prisma.user.deleteMany({ where: { id: { in: ids as string[] } } });
        return true;
      } catch {
        return false;
      }
    },
  },
};

export default resolvers;
