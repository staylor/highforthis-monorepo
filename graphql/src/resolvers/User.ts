import type { Prisma, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import type { Resolvers } from 'types/graphql';

import { endSessions } from '#/authentication';
import prisma from '#/database';
import type { WithIncludes } from '#/models';

import { parseConnection } from './utils/collection';
import { badInput, parseInput, removeEntities, resolveJoin } from './utils/helpers';
import { createUserSchema, updateUserSchema } from './validations';

const SALT_ROUNDS = 10;

const userIncludes = { roles: true } satisfies Prisma.UserInclude;

/** A user, with their roles when their query included them */
export type UserSource = WithIncludes<
  User,
  Prisma.UserGetPayload<{ include: typeof userIncludes }>
>;

const resolvers = {
  User: {
    roles(user) {
      return resolveJoin(user.roles, 'name', () =>
        prisma.userRole.findMany({ where: { userId: user.id } })
      );
    },
  },
  Query: {
    async users(_, args) {
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

    user(_, { id }) {
      return prisma.user.findUnique({ where: { id }, include: userIncludes });
    },
  },
  Mutation: {
    async createUser(_, { input }) {
      const { password, roles, ...fields } = parseInput(createUserSchema, input);
      if (!fields.email || !password) {
        throw badInput('Email and Password are required.');
      }
      const exists = await prisma.user.count({ where: { email: fields.email } });
      if (exists) {
        throw badInput('Email already exists.');
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

    async updateUser(_, { id, input }) {
      const { password, roles, ...fields } = parseInput(updateUserSchema, input);
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) throw badInput('User not found');

      if (fields.email && fields.email !== user.email) {
        const exists = await prisma.user.count({ where: { email: fields.email } });
        if (exists) {
          throw badInput('Email already exists.');
        }
      }

      const data: Prisma.UserUpdateInput = { ...fields };
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

      const updated = await prisma.user.update({ where: { id }, data, include: userIncludes });
      if (password) {
        // A new password signs the user out wherever they're signed in
        await endSessions(id);
      }
      return updated;
    },

    async removeUser(_, { ids }) {
      return removeEntities(prisma.user, ids);
    },
  },
} satisfies Resolvers;

export default resolvers;
