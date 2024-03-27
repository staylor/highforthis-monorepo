import type { AugmentedContext } from '../models/types';

import { parseConnection } from './utils/collection';
import resolveTags from './utils/resolveTags';

const resolvers = {
  Post: {
    id(post: any) {
      return post._id;
    },
    date(post: any) {
      return post.date || post.createdAt;
    },
    featuredMedia(post: any, args: any, { Media }: AugmentedContext) {
      return Media.findByIds(post.featuredMedia || []);
    },
    artists(post: any, args: any, { Term }: AugmentedContext) {
      return Term.findByIds(post.artists || []);
    },
  },
  Query: {
    async posts(root: any, args: any, { Post, authUser }: AugmentedContext) {
      const connectionArgs = { ...args };
      const userCanSee = authUser && authUser.roles && authUser.roles.includes('admin');
      if (!userCanSee) {
        connectionArgs.status = 'PUBLISH';
      }
      return parseConnection(Post, connectionArgs);
    },

    async post(root: any, { id, slug }: any, { Post, authUser }: AugmentedContext) {
      let post;
      if (id) {
        post = await Post.findOneById(id);
      } else {
        post = await Post.findOneBySlug(slug);
      }

      const userCanSee = authUser && authUser.roles && authUser.roles.includes('admin');
      if (post.status === 'DRAFT' && !userCanSee) {
        throw new Error('You do not have permission');
      }

      return post;
    },
  },
  Mutation: {
    async createPost(root: any, { input }: any, { Post, Taxonomy, Term }: AugmentedContext) {
      const data = { ...input };
      if (input.artists && input.artists.length > 0) {
        data.artists = await resolveTags('Artist', input.artists, {
          Taxonomy,
          Term,
        });
      } else {
        data.artists = [];
      }

      const id: any = await Post.insert(data);
      return Post.findOneById(id);
    },

    async updatePost(root: any, { id, input }: any, { Post, Taxonomy, Term }: AugmentedContext) {
      const data = { ...input };
      if (input.artists && input.artists.length > 0) {
        data.artists = await resolveTags('Artist', input.artists, {
          Taxonomy,
          Term,
        });
      } else {
        data.artists = [];
      }

      await Post.updateById(id, data);
      return Post.findOneById(id);
    },

    async removePost(root: any, { ids }: any, { Post }: AugmentedContext) {
      return Promise.all(ids.map((id: any) => Post.removeById(id)))
        .then(() => true)
        .catch(() => false);
    },
  },
};

export default resolvers;
