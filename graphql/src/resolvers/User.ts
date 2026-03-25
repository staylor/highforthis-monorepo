import bcrypt from 'bcryptjs';
import type { Prisma, User } from '@prisma/client';
import type {
  MutationCreateUserArgs,
  MutationRemoveUserArgs,
  MutationUpdateUserArgs,
  QueryUserArgs,
  QueryUsersArgs,
} from 'types/graphql';

import prisma from '#/database';

import { parseConnection } from './utils/collection';
import { removeEntities, resolveJoin } from './utils/helpers';
import { createUserSchema, updateUserSchema } from './validations';

const SALT_ROUNDS = 10;

const userIncludes = { roles: true };

const resolvers = {
  User: {
    roles(user: User) {
      return resolveJoin(user, 'roles', 'name', () =>
        prisma.userRole.findMany({ where: { userId: user.id } })
      );
    },
  },
  Query: {
    async users(_: unknown, args: QueryUsersArgs) {
      const { search, ...connectionArgs } = args;
      const where: Prisma.UserWhereInput = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { bio: { contains: search, mode: 'insensitive' } },
        ];
      }
      return parseConnection(prisma.user, connectionArgs, {
        where,
        orderBy: { name: 'asc' },
        include: userIncludes,
      });
    },

    user(_: unknown, { id }: QueryUserArgs) {
      return prisma.user.findUnique({ where: { id }, include: userIncludes });
    },
  },
  Mutation: {
    async createUser(_: unknown, { input }: MutationCreateUserArgs) {
      const { password, roles, ...fields } = createUserSchema.parse(input);
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
          email: fields.email,
          hash,
          roles: roles?.length ? { create: roles.map((name) => ({ name })) } : undefined,
        },
        include: userIncludes,
      });
    },

    async updateUser(_: unknown, { id, input }: MutationUpdateUserArgs) {
      const { password, roles, ...fields } = updateUserSchema.parse(input);
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) throw new Error('User not found');

      if (fields.email && fields.email !== user.email) {
        const exists = await prisma.user.count({ where: { email: fields.email } });
        if (exists) {
          throw new Error('Email already exists.');
        }
      }

      const data: Record<string, unknown> = { ...fields };
      if (password) {
        data.hash = await bcrypt.hash(password, SALT_ROUNDS);
      }

      if (typeof roles !== 'undefined') {
        await prisma.userRole.deleteMany({ where: { userId: id } });
        if (roles?.length) {
          await prisma.userRole.createMany({
            data: roles.map((name) => ({ userId: id, name })),
          });
        }
      }

      return prisma.user.update({ where: { id }, data, include: userIncludes });
    },

    async removeUser(_: unknown, { ids }: MutationRemoveUserArgs) {
      return removeEntities(prisma.user, ids);
    },
  },
};

export default resolvers;
