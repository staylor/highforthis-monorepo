import database from '../../src/database';
import Term from '../../src/models/Term';
import Artist from '../../src/models/Artist';
import Venue from '../../src/models/Venue';

const { db } = await database();
const term = new Term({ db });
const artist = new Artist({ db });
const venue = new Venue({ db });

const artists = await term.all({ taxonomy: 'artist', limit: 1000 });
const venues = await term.all({ taxonomy: 'venue', limit: 1000 });

const migrations = [
  ['artist', artist, artists],
  ['venue', venue, venues],
].map(async ([name, model, terms]: any) => {
  const promises: any[] = [];
  for (const term of terms) {
    console.log('Moving', term.name, 'to', name, 'collection');
    const newTerm = { ...term };
    delete newTerm.taxonomy;

    promises.push(
      model.collection.updateOne({ name: term.name }, { $set: newTerm }, { upsert: true })
    );
  }
  return Promise.all(promises);
});

await Promise.all(migrations);

process.exit(0);
