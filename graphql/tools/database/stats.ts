import { sql, type SqlStatement } from 'remix/data-table';

import db from '#/database/db';
import { artists, venues } from '#/database/tables';

/** The IDs and counts a query selects */
async function counts(statement: SqlStatement) {
  const { rows = [] } = await db.exec(statement);
  return rows as { id: string; count: number }[];
}

async function logArtistStats() {
  const results = await counts(sql`
    select "artistId" as id, count(*)::int as count from "ShowArtist"
    where "showId" in (select id from "Show" where attended)
    group by "artistId"
  `);

  const stats = await Promise.all(
    results.map(async (r) => {
      const artist = await db.find(artists, r.id);
      return { entity: artist?.name, count: r.count };
    })
  );

  console.log(
    'Artists:',
    stats.filter(({ count }) => count > 1).sort((a, b) => b.count - a.count)
  );
}

async function logVenueStats() {
  const results = await counts(sql`
    select "venueId" as id, count(*)::int as count from "Show"
    where attended
    group by "venueId"
  `);

  const stats = await Promise.all(
    results.map(async (r) => {
      const venue = await db.find(venues, r.id);
      return { entity: venue?.name, count: r.count };
    })
  );

  console.log(
    'Venues:',
    stats.filter(({ count }) => count > 1).sort((a, b) => b.count - a.count)
  );
}

await Promise.all([logArtistStats(), logVenueStats()]);

process.exit(0);
