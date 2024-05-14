import database from '../src/database';
import shows from '../src/jobs/shows';

const { db } = await database();

await shows(db);

process.exit(0);
