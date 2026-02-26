import type {
  MutationRemovePostArgs,
  MutationUpdatePostArgs,
  MutationCreatePostArgs,
  QueryPostArgs,
  QueryPostsArgs,
} from 'types/graphql';

import type { AppContext } from '~/models';
import { getUniqueSlug } from '~/models/utils';

import { parseConnection } from './utils/collection';
import resolveTags from './utils/resolveTags';

const resolvers = {
  Post: {
    date(post: any) {
      return new Date(post.date || post.createdAt).getTime();
    },
    async featuredMedia(post: any, _: unknown, { prisma }: AppContext) {
      const records = await prisma.postFeaturedMedia.findMany({
        where: { postId: post.id },
        include: { media: true },
      });
      return records.map((r: any) => r.media);
    },
    async artists(post: any, _: unknown, { prisma }: AppContext) {
      const records = await prisma.postArtist.findMany({
        where: { postId: post.id },
        include: { artist: true },
      });
      return records.map((r: any) => r.artist);
    },
  },
  Query: {
    async posts(_: unknown, args: QueryPostsArgs, { prisma, authUser }: AppContext) {
      const { search, status, ...connectionArgs } = args;
      const where: any = {};
      const userCanSee = authUser?.roles?.some?.((r: any) => r.name === 'admin');
      if (!userCanSee) {
        where.status = 'PUBLISH';
      } else if (status) {
        where.status = status;
      }
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { summary: { contains: search, mode: 'insensitive' } },
        ];
      }
      return parseConnection(prisma.post, connectionArgs, {
        where,
        orderBy: { date: 'desc' },
      });
    },

    async post(_: unknown, { id, slug }: QueryPostArgs, { prisma, authUser }: AppContext) {
      let post;
      if (id) {
        post = await prisma.post.findUnique({ where: { id } });
      } else if (slug) {
        post = await prisma.post.findUnique({ where: { slug } });
      }

      if (!post) return null;

      const userCanSee = authUser?.roles?.some?.((r: any) => r.name === 'admin');
      if (post.status === 'DRAFT' && !userCanSee) {
        throw new Error('You do not have permission');
      }

      return post;
    },
  },
  Mutation: {
    async createPost(_: unknown, { input }: MutationCreatePostArgs, { prisma }: AppContext) {
      const { featuredMedia, artists: inputArtists, ...data } = input as any;
      const slug = await getUniqueSlug(prisma.post, data.title);

      let artistIds: string[] = [];
      if (inputArtists?.length) {
        artistIds = await resolveTags(inputArtists, prisma);
      }

      return prisma.post.create({
        data: {
          ...data,
          slug,
          date: data.date ? new Date(data.date) : new Date(),
          featuredMedia: featuredMedia?.length
            ? { create: featuredMedia.map((mediaId: string) => ({ mediaId })) }
            : undefined,
          artists: artistIds.length
            ? { create: artistIds.map((artistId) => ({ artistId })) }
            : undefined,
        },
      });
    },

    async updatePost(_: unknown, { id, input }: MutationUpdatePostArgs, { prisma }: AppContext) {
      const { featuredMedia, artists: inputArtists, ...data } = input as any;
      const updateData: any = { ...data };
      if (data.date) {
        updateData.date = new Date(data.date);
      }

      if (typeof featuredMedia !== 'undefined') {
        await prisma.postFeaturedMedia.deleteMany({ where: { postId: id } });
        if (featuredMedia?.length) {
          await prisma.postFeaturedMedia.createMany({
            data: featuredMedia.map((mediaId: string) => ({ postId: id, mediaId })),
          });
        }
      }

      let artistIds: string[] = [];
      if (inputArtists?.length) {
        artistIds = await resolveTags(inputArtists, prisma);
      }
      await prisma.postArtist.deleteMany({ where: { postId: id } });
      if (artistIds.length) {
        await prisma.postArtist.createMany({
          data: artistIds.map((artistId) => ({ postId: id, artistId })),
        });
      }

      return prisma.post.update({ where: { id }, data: updateData });
    },

    async removePost(_: unknown, { ids }: MutationRemovePostArgs, { prisma }: AppContext) {
      try {
        await prisma.post.deleteMany({ where: { id: { in: ids as string[] } } });
        return true;
      } catch {
        return false;
      }
    },
  },
};

export default resolvers;
