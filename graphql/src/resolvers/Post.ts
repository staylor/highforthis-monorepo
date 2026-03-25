import type { Prisma, Post } from '@prisma/client';
import type {
  MutationRemovePostArgs,
  MutationUpdatePostArgs,
  MutationCreatePostArgs,
  QueryPostArgs,
  QueryPostsArgs,
} from 'types/graphql';

import prisma from '#/database';
import type { AppContext } from '#/models';
import { getUniqueSlug } from '#/models/utils';
import { extractText } from '#/utils/lexical';

import { parseConnection } from './utils/collection';
import { removeEntities, resolveJoin } from './utils/helpers';
import resolveTags from './utils/resolveTags';
import { createPostSchema, updatePostSchema } from './validations';

const postIncludes = {
  featuredMedia: { include: { media: true } },
  artists: { include: { artist: true } },
};

const resolvers = {
  Post: {
    date(post: Post) {
      return new Date(post.date || post.createdAt).getTime();
    },
    featuredMedia(post: Post) {
      return resolveJoin(post, 'featuredMedia', 'media', () =>
        prisma.postFeaturedMedia.findMany({
          where: { postId: post.id },
          include: { media: true },
        })
      );
    },
    artists(post: Post) {
      return resolveJoin(post, 'artists', 'artist', () =>
        prisma.postArtist.findMany({
          where: { postId: post.id },
          include: { artist: true },
        })
      );
    },
  },
  Query: {
    async posts(_: unknown, args: QueryPostsArgs, { authUser }: AppContext) {
      const { search, status, ...connectionArgs } = args;
      const where: Prisma.PostWhereInput = {};
      const userCanSee = authUser?.roles?.some((r) => r.name === 'admin');
      if (!userCanSee) {
        where.status = 'PUBLISH';
      } else if (status) {
        where.status = status;
      }
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
          { summary: { contains: search, mode: 'insensitive' } },
          { contentBody: { contains: search, mode: 'insensitive' } },
        ];
      }
      return parseConnection(prisma.post, connectionArgs, {
        where,
        orderBy: { date: 'desc' },
        include: postIncludes,
      });
    },

    async post(_: unknown, { id, slug }: QueryPostArgs, { authUser }: AppContext) {
      let post;
      if (id) {
        post = await prisma.post.findUnique({ where: { id }, include: postIncludes });
      } else if (slug) {
        post = await prisma.post.findUnique({ where: { slug }, include: postIncludes });
      }

      if (!post) return null;

      const userCanSee = authUser?.roles?.some((r) => r.name === 'admin');
      if (post.status === 'DRAFT' && !userCanSee) {
        throw new Error('You do not have permission');
      }

      return post;
    },
  },
  Mutation: {
    async createPost(_: unknown, { input }: MutationCreatePostArgs) {
      const {
        featuredMedia,
        artists: inputArtists,
        editorState,
        date,
        ...rest
      } = createPostSchema.parse(input);
      const slug = await getUniqueSlug(prisma.post, rest.title);
      const contentBody = editorState ? extractText(editorState) : null;

      let artistIds: string[] = [];
      if (inputArtists?.length) {
        artistIds = await resolveTags(inputArtists);
      }

      return prisma.post.create({
        data: {
          ...rest,
          slug,
          contentBody,
          editorState: (editorState ?? undefined) as Prisma.InputJsonValue | undefined,
          date: date ? new Date(date) : new Date(),
          featuredMedia: featuredMedia?.length
            ? { create: featuredMedia.map((mediaId) => ({ mediaId })) }
            : undefined,
          artists: artistIds.length
            ? { create: artistIds.map((artistId) => ({ artistId })) }
            : undefined,
        },
        include: postIncludes,
      });
    },

    async updatePost(_: unknown, { id, input }: MutationUpdatePostArgs) {
      const { featuredMedia, artists: inputArtists, editorState, ...data } =
        updatePostSchema.parse(input);
      const updateData: Record<string, unknown> = { ...data };
      if (data.date) {
        updateData.date = new Date(data.date);
      }
      if (editorState) {
        updateData.editorState = editorState;
        updateData.contentBody = extractText(editorState);
      }

      if (typeof featuredMedia !== 'undefined') {
        await prisma.postFeaturedMedia.deleteMany({ where: { postId: id } });
        if (featuredMedia?.length) {
          await prisma.postFeaturedMedia.createMany({
            data: featuredMedia.map((mediaId) => ({ postId: id, mediaId })),
          });
        }
      }

      let artistIds: string[] = [];
      if (inputArtists?.length) {
        artistIds = await resolveTags(inputArtists);
      }
      await prisma.postArtist.deleteMany({ where: { postId: id } });
      if (artistIds.length) {
        await prisma.postArtist.createMany({
          data: artistIds.map((artistId) => ({ postId: id, artistId })),
        });
      }

      return prisma.post.update({ where: { id }, data: updateData, include: postIncludes });
    },

    async removePost(_: unknown, { ids }: MutationRemovePostArgs) {
      return removeEntities(prisma.post, ids);
    },
  },
};

export default resolvers;
