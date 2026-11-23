import { eq, inList, isNull } from 'remix/data-table';

import { createLogger } from '@highforthis/shared/logger';

import { hasAppleMusicKeys, searchArtists } from '#/appleMusic';
import db from '#/database/db';
import {
  appleMusicArtworks,
  appleMusicData,
  appleMusicGenres,
  artists,
  newId,
} from '#/database/tables';
import { normalizeName } from '#/listings';

const logger = createLogger({ serviceName: 'graphql' });

interface Artwork {
  width?: number | null;
  height?: number | null;
  url?: string | null;
  bgColor?: string | null;
  textColor1?: string | null;
  textColor2?: string | null;
  textColor3?: string | null;
  textColor4?: string | null;
}

/** Apple Music's data for an artist, as Apple Music or the artist form gives it */
interface AppleMusicDetails {
  id?: string | null;
  url?: string | null;
  genreNames?: string[] | null;
  artwork?: Artwork | null;
}

/**
 * Saves an artist's Apple Music data: its ID and URL, its genres in place of any it had, and its
 * artwork when there is some
 */
export async function saveAppleMusic(artistId: string, details: AppleMusicDetails) {
  await db.transaction(async (tx) => {
    const values = { appleId: details.id, url: details.url };
    const existing = await tx.findOne(appleMusicData, { where: { artistId } });
    const id = existing?.id ?? newId();
    if (!existing) {
      await tx.create(appleMusicData, { ...values, id, artistId });
    } else {
      if (values.appleId !== undefined || values.url !== undefined) {
        await tx.update(appleMusicData, id, values);
      }
      await tx.deleteMany(appleMusicGenres, { where: { appleMusicDataId: id } });
    }
    if (details.genreNames?.length) {
      await tx.createMany(
        appleMusicGenres,
        details.genreNames.map((name) => ({ id: newId(), appleMusicDataId: id, name }))
      );
    }
    if (details.artwork) {
      await tx
        .query(appleMusicArtworks)
        .upsert(
          { ...details.artwork, id: newId(), appleMusicDataId: id },
          { conflictTarget: ['appleMusicDataId'], update: details.artwork }
        );
    }
  });
}

/** The artists without Apple Music's data, of those with these IDs when there are any */
export function withoutAppleMusic(artistIds?: string[]) {
  let query = db
    .query(artists)
    .leftJoin(appleMusicData, eq(appleMusicData.artistId, artists.id))
    .where(isNull(appleMusicData.id));
  if (artistIds) {
    query = query.where(inList(artists.id, artistIds));
  }
  return query.select({ id: artists.id, name: artists.name }).orderBy(artists.name, 'asc').all();
}

/**
 * Saves Apple Music's data, such as the artwork on an artist's page, to those of the artists that
 * have none, and answers how many it saved. An artist's data is that of the first artist Apple
 * Music finds with the same name, whatever its case, accents or punctuation. An artist Apple
 * Music doesn't have is left as it was, as is one whose lookup fails.
 */
export async function fillAppleMusic(artistIds: string[]): Promise<number> {
  if (artistIds.length === 0 || !hasAppleMusicKeys()) {
    return 0;
  }
  const missing = await withoutAppleMusic(artistIds);

  let saved = 0;
  // One at a time: a list of shows can add many artists at once
  for (const { id, name } of missing) {
    try {
      const key = normalizeName(name);
      const found = (await searchArtists(name)).find(
        (artist) => normalizeName(artist.name) === key
      );
      if (found) {
        await saveAppleMusic(id, found);
        saved += 1;
      }
    } catch (error) {
      logger.warn({ err: error, artist: name }, 'Could not look up an artist on Apple Music');
    }
  }
  return saved;
}

/** Does the same once the mutation that added the artists has answered, so it isn't kept waiting. */
export function fillAppleMusicLater(artistIds: string[]): void {
  fillAppleMusic(artistIds).catch((error: unknown) => {
    logger.warn({ err: error }, 'Could not look up artists on Apple Music');
  });
}
