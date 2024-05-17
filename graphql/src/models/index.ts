import type { Db } from 'mongodb';

import Artist from './Artist';
import Media from './Media';
import Podcast from './Podcast';
import Post from './Post';
import Settings from './Settings';
import Show from './Show';
import User from './User';
import Venue from './Venue';
import Video from './Video';

interface ModelInstanceMap {
  [key: string]: any;
}

type Context = {
  db: Db;
} & ModelInstanceMap;

export default function addModelsToContext(db: Db): Context {
  const context = { db };

  return {
    db,
    Artist: new Artist(context),
    Media: new Media(context),
    Podcast: new Podcast(context),
    Post: new Post(context),
    Settings: new Settings(context),
    Show: new Show(context),
    User: new User(context),
    Venue: new Venue(context),
    Video: new Video(context),
  };
}
