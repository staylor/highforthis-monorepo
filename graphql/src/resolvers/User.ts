import bcrypt from 'bcryptjs';
import { and, ilike, ne, or, type TableRow } from 'remix/data-table';
import type { Resolvers } from 'types/graphql';

import { endSessions } from '#/authentication';
import db from '#/database/db';
import { containing, matching } from '#/database/search';
import type { Loaded } from '#/database/tables';
import { newId, userRoleRows, userRoles, users } from '#/database/tables';

import { parseConnection } from './utils/collection';
import { badInput, parseInput, removeRows, resolveJoin, unique } from './utils/helpers';
import { createUserSchema, updateUserSchema } from './validations';

const SALT_ROUNDS = 10;

/**
 * Users with this email, whatever its case. Signing in matches an email whatever its case, so two
 * users' emails mustn't differ only in case.
 */
const withEmail = (email: string) => ilike('email', matching(email));

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
      const exists = await db.count(users, { where: withEmail(email) });
      if (exists) {
        throw badInput('Email already exists.');
      }
      const hash = await bcrypt.hash(password, SALT_ROUNDS);
      const id = newId();
      const names = unique(roles ?? []);
      await db.transaction(async (tx) => {
        await tx.create(users, { ...fields, id, email, hash });
        if (names.length) {
          await tx.createMany(
            userRoles,
            names.map((name) => ({ id: newId(), userId: id, name }))
          );
        }
      });
      return db.find(users, id, { with: userIncludes });
    },

    async updateUser(_, { id, input }) {
      const { password, roles, ...fields } = parseInput(updateUserSchema, input);
      const user = await db.find(users, id);
      if (!user) throw badInput('User not found');

      // Another user's, that is: changing the case of one's own email is fine
      if (fields.email) {
        const exists = await db.count(users, {
          where: and(withEmail(fields.email), ne('id', id)),
        });
        if (exists) {
          throw badInput('Email already exists.');
        }
      }

      const values: Partial<TableRow<typeof users>> = { ...fields };
      if (password) {
        values.hash = await bcrypt.hash(password, SALT_ROUNDS);
      }

      // The roles and the rest are saved together: roles that can't be saved, such as a list with
      // one twice, would otherwise leave the user with none, and an admin out of the admin
      const updated = await db.transaction(async (tx) => {
        if (roles !== undefined) {
          const names = unique(roles ?? []);
          await tx.deleteMany(userRoles, { where: { userId: id } });
          if (names.length) {
            await tx.createMany(
              userRoles,
              names.map((name) => ({ id: newId(), userId: id, name }))
            );
          }
        }
        return tx.update(users, id, values, { with: userIncludes });
      });
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
