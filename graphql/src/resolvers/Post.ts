import { ilike, or, type TableRow } from 'remix/data-table';
import type { Resolvers } from 'types/graphql';

import { isAdmin } from '#/authorization';
import db from '#/database/db';
import { containing } from '#/database/search';
import type { Loaded } from '#/database/tables';
import {
  newId,
  postArtists,
  postFeaturedMedia,
  postFeaturedMediaUpload,
  postMedia,
  posts,
  postTagArtist,
  postTags,
} from '#/database/tables';
import { getUniqueSlug, slugsIn } from '#/models/utils';
import { extractText } from '#/utils/lexical';

import { fillAppleMusicLater } from './utils/appleMusicData';
import { parseConnection } from './utils/collection';
import { parseInput, removeRows, resolveJoin, unique } from './utils/helpers';
import resolveTags from './utils/resolveTags';
import { createPostSchema, updatePostSchema } from './validations';

type Post = TableRow<typeof posts>;

const postIncludes = { featuredMedia: postMedia, artists: postTags };

/** A post, with its featured media and artists when its query loaded them */
export type PostSource = Post & {
  featuredMedia?: Loaded<typeof postMedia>;
  artists?: Loaded<typeof postTags>;
};

const resolvers = {
  Post: {
    date(post) {
      return new Date(post.date ?? post.createdAt).getTime();
    },
    featuredMedia(post) {
      return resolveJoin(post.featuredMedia, 'media', () =>
        db.findMany(postFeaturedMedia, {
          where: { postId: post.id },
          orderBy: ['position', 'asc'],
          with: { media: postFeaturedMediaUpload },
        })
      );
    },
    artists(post) {
      return resolveJoin(post.artists, 'artist', () =>
        db.findMany(postArtists, {
          where: { postId: post.id },
          orderBy: ['position', 'asc'],
          with: { artist: postTagArtist },
        })
      );
    },
  },
  Query: {
    async posts(_, args, { authUser }) {
      const { search, status, ...connectionArgs } = args;
      let query = db.query(posts);
      const userCanSee = isAdmin(authUser);
      if (!userCanSee) {
        query = query.where({ status: 'PUBLISH' });
      } else if (status) {
        query = query.where({ status });
      }
      if (search) {
        const pattern = containing(search);
        query = query.where(
          or(
            ilike('title', pattern),
            ilike('slug', pattern),
            ilike('summary', pattern),
            ilike('contentBody', pattern)
          )
        );
      }
      return parseConnection(
        {
          count: () => query.count(),
          findMany: ({ skip, take }) =>
            query
              .with(postIncludes)
              .orderBy('date', 'desc')
              .orderBy('id', 'desc')
              .offset(skip)
              .limit(take)
              .all(),
        },
        connectionArgs
      );
    },

    async post(_, { id, slug }, { authUser }) {
      let post;
      if (id) {
        post = await db.find(posts, id, { with: postIncludes });
      } else if (slug) {
        post = await db.findOne(posts, { where: { slug }, with: postIncludes });
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
      const slug = await getUniqueSlug(slugsIn(db, posts), rest.title);
      const contentBody = editorState ? extractText(editorState) : null;
      const media = unique(featuredMedia ?? []);

      const newArtists: string[] = [];
      const id = newId();
      await db.transaction(async (tx) => {
        const artistIds = unique(await resolveTags(tx, inputArtists ?? [], newArtists));
        await tx.create(posts, {
          ...rest,
          id,
          slug,
          contentBody,
          editorState: editorState ?? undefined,
          date: typeof date === 'number' ? new Date(date) : new Date(),
        });
        if (media.length) {
          await tx.createMany(
            postFeaturedMedia,
            media.map((mediaId, position) => ({ postId: id, mediaId, position }))
          );
        }
        if (artistIds.length) {
          await tx.createMany(
            postArtists,
            artistIds.map((artistId, position) => ({ postId: id, artistId, position }))
          );
        }
      });
      fillAppleMusicLater(newArtists);
      return db.find(posts, id, { with: postIncludes });
    },

    async updatePost(_, { id, input }) {
      const {
        featuredMedia,
        artists: inputArtists,
        editorState,
        date,
        ...data
      } = parseInput(updatePostSchema, input);
      const values: Partial<Post> = { ...data };
      // Every post has a date, so one left out or sent as null keeps the saved one
      if (typeof date === 'number') {
        values.date = new Date(date);
      }
      if (editorState) {
        values.editorState = editorState;
        values.contentBody = extractText(editorState);
      }

      // Tags left out keep the ones the post has, as featured media left out do. The admin's form
      // sends an empty list once every tag is removed.
      const newArtists: string[] = [];
      const post = await db.transaction(async (tx) => {
        if (featuredMedia !== undefined) {
          const media = unique(featuredMedia ?? []);
          await tx.deleteMany(postFeaturedMedia, { where: { postId: id } });
          if (media.length) {
            await tx.createMany(
              postFeaturedMedia,
              media.map((mediaId, position) => ({ postId: id, mediaId, position }))
            );
          }
        }
        if (inputArtists !== undefined) {
          const artistIds = unique(await resolveTags(tx, inputArtists ?? [], newArtists));
          await tx.deleteMany(postArtists, { where: { postId: id } });
          if (artistIds.length) {
            await tx.createMany(
              postArtists,
              artistIds.map((artistId, position) => ({ postId: id, artistId, position }))
            );
          }
        }
        return tx.update(posts, id, values, { with: postIncludes });
      });
      fillAppleMusicLater(newArtists);
      return post;
    },

    async removePost(_, { ids }) {
      return removeRows(posts, ids);
    },
  },
} satisfies Resolvers;

export default resolvers;
