import { createLogger } from '@highforthis/shared/logger';

import { hasAppleMusicKeys, searchArtists } from '#/appleMusic';
import prisma from '#/database';
import { normalizeName } from '#/listings';

const logger = createLogger({ serviceName: 'graphql' });

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
  const artists = await prisma.artist.findMany({
    where: { id: { in: artistIds }, appleMusic: { is: null } },
    select: { id: true, name: true },
  });

  let saved = 0;
  // One at a time: a list of shows can add many artists at once
  for (const { id, name } of artists) {
    try {
      const key = normalizeName(name);
      const found = (await searchArtists(name)).find(
        (artist) => normalizeName(artist.name) === key
      );
      if (found) {
        await prisma.appleMusicData.create({
          data: {
            artistId: id,
            appleId: found.id,
            url: found.url,
            genreNames: { create: found.genreNames.map((genre) => ({ name: genre })) },
            artwork: found.artwork ? { create: found.artwork } : undefined,
          },
        });
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
