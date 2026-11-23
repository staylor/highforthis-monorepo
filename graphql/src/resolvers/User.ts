import bcrypt from 'bcryptjs';
import { ilike, or, type TableRow } from 'remix/data-table';
import type { Resolvers } from 'types/graphql';

import { endSessions } from '#/authentication';
import db from '#/database/db';
import { containing } from '#/database/search';
import type { Loaded } from '#/database/tables';
import { newId, userRoleRows, userRoles, users } from '#/database/tables';

import { parseConnection } from './utils/collection';
import { badInput, parseInput, removeRows, resolveJoin } from './utils/helpers';
import { createUserSchema, updateUserSchema } from './validations';

const SALT_ROUNDS = 10;

const userIncludes = { roles: userRoleRows };

/** A user, with their roles when their query loaded them */
export type UserSource = TableRow<typeof users> & { roles?: Loaded<typeof userRoleRows> };

const resolvers = {
  User: {
    roles(user) {
      return resolveJoin(user.roles, 'name', () =>
        db.findMany(userRoles, { where: { userId: user.id } })
      );
    },
  },
  Query: {
    async users(_, args) {
      const { search, ...connectionArgs } = args;
      let query = db.query(users);
      if (search) {
        const pattern = containing(search);
        query = query.where(
          or(ilike('name', pattern), ilike('email', pattern), ilike('bio', pattern))
        );
      }
      return parseConnection(
        {
          count: () => query.count(),
          findMany: ({ skip, take }) =>
            query.with(userIncludes).orderBy('name', 'asc').offset(skip).limit(take).all(),
        },
        connectionArgs
      );
    },

    user(_, { id }) {
      return db.find(users, id, { with: userIncludes });
    },
  },
  Mutation: {
    async createUser(_, { input }) {
      const { password, roles, email, ...fields } = parseInput(createUserSchema, input);
      if (!email || !password) {
        throw badInput('Email and Password are required.');
      }
      const exists = await db.count(users, { where: { email } });
      if (exists) {
        throw badInput('Email already exists.');
      }
      const hash = await bcrypt.hash(password, SALT_ROUNDS);
      const id = newId();
      await db.transaction(async (tx) => {
        await tx.create(users, { ...fields, id, email, hash });
        if (roles?.length) {
          await tx.createMany(
            userRoles,
            roles.map((name) => ({ id: newId(), userId: id, name }))
          );
        }
      });
      return db.find(users, id, { with: userIncludes });
    },

    async updateUser(_, { id, input }) {
      const { password, roles, ...fields } = parseInput(updateUserSchema, input);
      const user = await db.find(users, id);
      if (!user) throw badInput('User not found');

      if (fields.email && fields.email !== user.email) {
        const exists = await db.count(users, { where: { email: fields.email } });
        if (exists) {
          throw badInput('Email already exists.');
        }
      }

      const values: Partial<TableRow<typeof users>> = { ...fields };
      if (password) {
        values.hash = await bcrypt.hash(password, SALT_ROUNDS);
      }

      if (typeof roles !== 'undefined') {
        await db.deleteMany(userRoles, { where: { userId: id } });
        if (roles?.length) {
          await db.createMany(
            userRoles,
            roles.map((name) => ({ id: newId(), userId: id, name }))
          );
        }
      }

      const updated = await db.update(users, id, values, { with: userIncludes });
      if (password) {
        // A new password signs the user out wherever they're signed in
        await endSessions(id);
      }
      return updated;
    },

    async removeUser(_, { ids }) {
      return removeRows(users, ids);
    },
  },
} satisfies Resolvers;

export default resolvers;
