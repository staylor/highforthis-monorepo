import type { Document } from 'mongodb';
import type {
  MutationCreateUserArgs,
  MutationRemoveUserArgs,
  MutationUpdateUserArgs,
  QueryUserArgs,
  QueryUsersArgs,
} from 'types/graphql';

import { parseConnection } from './utils/collection';

import type User from '@/models/User';

const resolvers = {
  User: {
    id(user: Document) {
      return user._id;
    },
  },
  Query: {
    async users(_: unknown, args: QueryUsersArgs, { User }: { User: User }) {
      return parseConnection(User, args);
    },

    user(_: unknown, { id }: QueryUserArgs, { User }: { User: User }) {
      return User.findOneById(id);
    },
  },
  Mutation: {
    async createUser(_: unknown, { input }: MutationCreateUserArgs, { User }: { User: User }) {
      const id = await User.insert(input);
      return User.findOneById(id);
    },

    async updateUser(_: unknown, { id, input }: MutationUpdateUserArgs, { User }: { User: User }) {
      await User.updateById(id, input);
      return User.findOneById(id);
    },

    async removeUser(_: unknown, { ids }: MutationRemoveUserArgs, { User }: { User: User }) {
      return Promise.all(ids.map((id) => User.removeById(id)))
        .then(() => true)
        .catch(() => false);
    },
  },
};

export default resolvers;
