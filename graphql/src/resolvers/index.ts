import merge from 'lodash.merge';

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

const modules = {
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
} as any;

const resolvers = Object.keys(modules).reduce(
  (memo, name) => {
    merge(memo, modules[name]);
    return memo;
  },
  {} as { [key: string]: any }
);

export default resolvers;
