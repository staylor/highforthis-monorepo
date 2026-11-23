import { ilike } from 'remix/data-table';

import db from '#/database/db';
import { matching } from '#/database/search';
import { artists, newId } from '#/database/tables';
import { getUniqueSlug, slugsIn } from '#/models/utils';

import { fillAppleMusicLater } from './appleMusicData';

/**
 * The IDs of the artists with these names, in the order given, adding the artists that are new. A
 * name finds its artist however it's capitalized, and a name given twice is one artist.
 */
export default async function resolveTags(inputTerms: string[]): Promise<string[]> {
  const names = new Map<string, string>();
  for (const term of inputTerms) {
    const name = term.trim();
    if (name && !names.has(name.toLowerCase())) {
      names.set(name.toLowerCase(), name);
    }
  }

  const ids: string[] = [];
  const newArtists: string[] = [];
  // One at a time, so two new names can't claim the same slug
  for (const name of names.values()) {
    const artist = await db.findOne(artists, {
      where: ilike('name', matching(name)),
      orderBy: ['createdAt', 'asc'],
    });
    if (artist) {
      ids.push(artist.id);
    } else {
      const id = newId();
      await db.create(artists, { id, name, slug: await getUniqueSlug(slugsIn(db, artists), name) });
      newArtists.push(id);
      ids.push(id);
    }
  }
  fillAppleMusicLater(newArtists);
  return ids;
}
