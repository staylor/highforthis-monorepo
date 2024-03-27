import type { Db } from 'mongodb';

import type { ModelContext } from './types';
import Media from './Media';
import Place from './Place';
import Podcast from './Podcast';
import Post from './Post';
import Settings from './Settings';
import Show from './Show';
import Taxonomy from './Taxonomy';
import Term from './Term';
import User from './User';
import Video from './Video';

export default function addModelsToContext(db: Db): any {
  const context = { db } as ModelContext;
  const models = {
    Media: new Media(context),
    Place: new Place(context),
    Podcast: new Podcast(context),
    Post: new Post(context),
    Settings: new Settings(context),
    Show: new Show(context),
    Taxonomy: new Taxonomy(context),
    Term: new Term(context),
    User: new User(context),
    Video: new Video(context),
  };

  return {
    db,
    ...models,
  };
}
