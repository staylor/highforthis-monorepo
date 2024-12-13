import database from '~/database';
import shows from '~/jobs/shows';

const { db } = await database();

await shows(db);

process.exit(0);
