import type { MutationResolvers, QueryResolvers, Resolvers } from 'types/graphql';

import { type AnyResolver, requireAdmin } from '#/authorization';
import APIKeys from '#/resolvers/APIKeys';
import AppleMusic from '#/resolvers/AppleMusic';
import Artist from '#/resolvers/Artist';
import EditorState from '#/resolvers/EditorState';
import Listing from '#/resolvers/Listing';
import Media from '#/resolvers/Media';
import Podcast from '#/resolvers/Podcast';
import Post from '#/resolvers/Post';
import Settings from '#/resolvers/Settings';
import Show from '#/resolvers/Show';
import User from '#/resolvers/User';
import Venue from '#/resolvers/Venue';
import Video from '#/resolvers/Video';

const modules: Resolvers[] = [
  APIKeys,
  AppleMusic,
  Artist,
  EditorState,
  Listing,
  Media,
  Podcast,
  Post,
  Settings,
  Show,
  User,
  Venue,
  Video,
];

// Each module's types, with the fields the modules add to the same type merged into one
const merged = modules.reduce<Record<string, object>>((all, mod) => {
  for (const [type, fields] of Object.entries(mod)) {
    all[type] = { ...all[type], ...fields };
  }
  return all;
}, {}) as Resolvers;

/** The fields, with the ones `names` lists for admins only */
function forAdmins<TFields extends { [Name in keyof TFields]?: AnyResolver }>(
  fields: TFields,
  names: (keyof TFields)[]
): TFields {
  const guarded = { ...fields };
  for (const name of names) {
    const resolver = fields[name];
    if (typeof resolver !== 'function') {
      throw new Error(`Unknown admin field: ${String(name)}`);
    }
    guarded[name] = requireAdmin(resolver);
  }
  return guarded;
}

// Every mutation, and any query listed here, requires an admin. `uploads` lists the whole media
// library, with each file's original name, including the images for posts not yet published.
const adminQueries: (keyof QueryResolvers)[] = [
  'appleMusicAlbums',
  'uploads',
  'user',
  'users',
  'venueListings',
];

const { Query = {}, Mutation = {} } = merged;

const resolvers = {
  ...merged,
  Query: forAdmins(Query, adminQueries),
  Mutation: forAdmins(Mutation, Object.keys(Mutation) as (keyof MutationResolvers)[]),
} satisfies Resolvers;

export default resolvers;
