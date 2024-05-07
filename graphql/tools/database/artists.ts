import database from '../../src/database';
import Show from '../../src/models/Show';

const { db } = await database();
const term = new Show({ db });
const shows = await term.all({ limit: 10000 });

for (const show of shows) {
  if (show.artists) {
    continue;
  }

  const id = String(show._id);
  await term.updateById(id, {
    artists: [show.artist],
  });
}

process.exit(0);
