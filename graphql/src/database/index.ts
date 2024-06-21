import type { Db } from 'mongodb';
import { MongoClient } from 'mongodb';

import createIndexes from './indexes';
import createViews from './views';

async function database(): Promise<{ db: Db; client: MongoClient }> {
  if (!process.env.MONGO_URL) {
    throw new Error('MONGO_URL must exist on process.env');
  }

  const client = await MongoClient.connect(process.env.MONGO_URL).catch((err: Error) => {
    console.log(err);
    throw new Error('Cannot connect to MongoDB instance!');
  });

  const connection = client.db(process.env.MONGO_DB);
  if (!connection) {
    throw new Error('Cannot connect to database!');
  }

  await createIndexes(connection);
  await createViews(connection);

  return {
    db: connection,
    client,
  };
}

export default database;
