import database from '../../src/database';
import Show from '../../src/models/Show';

const { db } = await database();
const model = new Show({ db });

async function logStats(entity: string) {
  const results: any[] = await model.stats(entity);

  const data = results.map(({ _id, ...value }) => value).filter(({ count }) => count > 1);

  console.log(data);
}

await Promise.all([logStats('artist'), logStats('venue')]);

process.exit(0);
