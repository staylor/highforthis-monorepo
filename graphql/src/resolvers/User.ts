import type { AugmentedContext } from '../models/types';

import { parseConnection } from './utils/collection';

const resolvers = {
  User: {
    id(user: any) {
      return user._id;
    },
  },
  Query: {
    async users(root: any, args: any, { User }: AugmentedContext) {
      return parseConnection(User, args);
    },

    user(root: any, { id }: any, { User }: AugmentedContext) {
      return User.findOneById(id);
    },
  },
  Mutation: {
    async createUser(root: any, { input }: any, { User }: AugmentedContext) {
      const id = await User.insert(input);
      return User.findOneById(id);
    },

    async updateUser(root: any, { id, input }: any, { User }: AugmentedContext) {
      await User.updateById(id, input);
      return User.findOneById(id);
    },

    async removeUser(root: any, { ids }: any, { User }: AugmentedContext) {
      return Promise.all(ids.map((id: string) => User.removeById(id)))
        .then(() => true)
        .catch(() => false);
    },
  },
};

export default resolvers;
