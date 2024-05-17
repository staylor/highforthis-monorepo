import type { Document } from 'mongodb';
import { PostStatus } from 'types/graphql';
import type {
  MutationRemovePostArgs,
  MutationUpdatePostArgs,
  MutationCreatePostArgs,
  QueryPostArgs,
  QueryPostsArgs,
} from 'types/graphql';

import type Media from '@/models/Media';
import type Artist from '@/models/Artist';
import type Post from '@/models/Post';

import { parseConnection } from './utils/collection';
import resolveTags from './utils/resolveTags';

const resolvers = {
  Post: {
    id(post: Document) {
      return post._id;
    },
    date(post: Document) {
      return post.date || post.createdAt;
    },
    featuredMedia(post: Document, _: unknown, { Media }: { Media: Media }) {
      return Media.findByIds(post.featuredMedia || []);
    },
    artists(post: Document, _: unknown, { Artist }: { Artist: Artist }) {
      return Artist.findByIds(post.artists || []);
    },
  },
  Query: {
    async posts(
      _: unknown,
      args: QueryPostsArgs,
      { Post, authUser }: { Post: Post; authUser: Document }
    ) {
      const connectionArgs = { ...args };
      const userCanSee = authUser && authUser.roles && authUser.roles.includes('admin');
      if (!userCanSee) {
        connectionArgs.status = PostStatus.Publish;
      }
      return parseConnection(Post, connectionArgs);
    },

    async post(
      _: unknown,
      { id, slug }: QueryPostArgs,
      { Post, authUser }: { Post: Post; authUser: Document }
    ) {
      let post;
      if (id) {
        post = await Post.findOneById(id);
      } else if (slug) {
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
    async createPost(
      _: unknown,
      { input }: MutationCreatePostArgs,
      { Post, Artist }: { Post: Post; Artist: Artist }
    ) {
      const data = { ...input };
      if (input.artists && input.artists.length > 0) {
        data.artists = await resolveTags(input.artists as string[], {
          Artist,
        });
      } else {
        data.artists = [];
      }

      const id = await Post.insert(data);
      return Post.findOneById(String(id));
    },

    async updatePost(
      _: unknown,
      { id, input }: MutationUpdatePostArgs,
      { Post, Artist }: { Post: Post; Artist: Artist }
    ) {
      const data = { ...input };
      if (input.artists && input.artists.length > 0) {
        data.artists = await resolveTags(input.artists as string[], {
          Artist,
        });
      } else {
        data.artists = [];
      }

      await Post.updateById(id, data);
      return Post.findOneById(id);
    },

    async removePost(_: unknown, { ids }: MutationRemovePostArgs, { Post }: { Post: Post }) {
      return Promise.all(ids.map((id) => Post.removeById(id)))
        .then(() => true)
        .catch(() => false);
    },
  },
};

export default resolvers;
