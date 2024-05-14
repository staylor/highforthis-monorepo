import type { Db } from 'mongodb';

import Show from '../models/Show';

async function cleanupShows(db: Db) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);
  const model = new Show({ db });
  const result = await model.collection.deleteMany({
    date: { $lt: sixMonthsAgo.getTime() },
    attended: { $in: [null, false] },
  });
  console.log('[Shows]', result);
}

export default cleanupShows;
