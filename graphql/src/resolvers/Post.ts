import type { Prisma, Post } from '@prisma/client';
import type { Resolvers } from 'types/graphql';

import { isAdmin } from '#/authorization';
import prisma from '#/database';
import type { WithIncludes } from '#/models';
import { getUniqueSlug } from '#/models/utils';
import { extractText } from '#/utils/lexical';

import { parseConnection } from './utils/collection';
import { parseInput, removeEntities, resolveJoin } from './utils/helpers';
import resolveTags from './utils/resolveTags';
import { createPostSchema, updatePostSchema } from './validations';

// The artwork on post lists picks a size from each image's crops, which took a query per image
// when ImageUpload.crops loaded them
const featuredMediaIncludes = {
  media: { include: { crops: true } },
} satisfies Prisma.PostFeaturedMediaInclude;

const postIncludes = {
  featuredMedia: { include: featuredMediaIncludes },
  artists: { include: { artist: true } },
} satisfies Prisma.PostInclude;

/** A post, with its featured media and artists when its query included them */
export type PostSource = WithIncludes<
  Post,
  Prisma.PostGetPayload<{ include: typeof postIncludes }>
>;

const resolvers = {
  Post: {
    date(post) {
      return new Date(post.date || post.createdAt).getTime();
    },
    featuredMedia(post) {
      return resolveJoin(post.featuredMedia, 'media', () =>
        prisma.postFeaturedMedia.findMany({
          where: { postId: post.id },
          include: featuredMediaIncludes,
        })
      );
    },
    artists(post) {
      return resolveJoin(post.artists, 'artist', () =>
        prisma.postArtist.findMany({
          where: { postId: post.id },
          include: { artist: true },
        })
      );
    },
  },
  Query: {
    async posts(_, args, { authUser }) {
      const { search, status, ...connectionArgs } = args;
      const where: Prisma.PostWhereInput = {};
      const userCanSee = isAdmin(authUser);
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

    async post(_, { id, slug }, { authUser }) {
      let post;
      if (id) {
        post = await prisma.post.findUnique({ where: { id }, include: postIncludes });
      } else if (slug) {
        post = await prisma.post.findUnique({ where: { slug }, include: postIncludes });
      }

      if (!post) return null;

      // A draft is as missing as a post that doesn't exist, so its slug can't be found out
      if (post.status === 'DRAFT' && !isAdmin(authUser)) {
        return null;
      }

      return post;
    },
  },
  Mutation: {
    async createPost(_, { input }) {
      const {
        featuredMedia,
        artists: inputArtists,
        editorState,
        date,
        ...rest
      } = parseInput(createPostSchema, input);
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
          editorState: editorState ?? undefined,
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

    async updatePost(_, { id, input }) {
      const {
        featuredMedia,
        artists: inputArtists,
        editorState,
        date,
        ...data
      } = parseInput(updatePostSchema, input);
      const updateData: Prisma.PostUpdateInput = { ...data };
      // Every post has a date, so one left out or sent as null keeps the saved one
      if (date) {
        updateData.date = new Date(date);
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

    async removePost(_, { ids }) {
      return removeEntities(prisma.post, ids);
    },
  },
} satisfies Resolvers;

export default resolvers;
