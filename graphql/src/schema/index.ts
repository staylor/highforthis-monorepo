import APIKeys from '@/schema/APIKeys';
import AppleMusic from '@/schema/AppleMusic';
import Artist from '@/schema/Artist';
import EditorState from '@/schema/EditorState';
import Media from '@/schema/Media';
import Podcast from '@/schema/Podcast';
import Post from '@/schema/Post';
import Settings from '@/schema/Settings';
import Show from '@/schema/Show';
import User from '@/schema/User';
import Venue from '@/schema/Venue';
import Video from '@/schema/Video';

const modules = {
  APIKeys,
  AppleMusic,
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
} as Record<string, string>;

const typeDefs = `#graphql
  scalar ObjID
  type Query

  type Mutation

  directive @cache(
    key: String = ""
  ) on FIELD

  type PageInfo {
    startCursor: String
    endCursor: String
    hasPreviousPage: Boolean
    hasNextPage: Boolean
  }

  ${Object.values(modules).map((node) => `${node.replace('#graphql', '')}\n\n`)}
`;

export default typeDefs;
