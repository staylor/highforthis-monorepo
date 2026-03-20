import APIKeys from '#/resolvers/APIKeys';
import Artist from '#/resolvers/Artist';
import EditorState from '#/resolvers/EditorState';
import Media from '#/resolvers/Media';
import Podcast from '#/resolvers/Podcast';
import Post from '#/resolvers/Post';
import Settings from '#/resolvers/Settings';
import Show from '#/resolvers/Show';
import User from '#/resolvers/User';
import Venue from '#/resolvers/Venue';
import Video from '#/resolvers/Video';

type ResolverMap = Record<string, Record<string, unknown>>;

const modules: ResolverMap[] = [
  APIKeys,
  Artist,
  EditorState,
  Media,
  Podcast,
  Post,
  Settings,
  Show,
  User,
  Venue,
  Video,
];

const resolvers = modules.reduce<ResolverMap>((merged, mod) => {
  for (const [key, value] of Object.entries(mod)) {
    merged[key] = { ...merged[key], ...value };
  }
  return merged;
}, {});

export default resolvers;
