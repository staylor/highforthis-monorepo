import type { PrismaClient } from '@prisma/client';

import { getUniqueSlug } from '#/models/utils';

export default async function resolveTags(
  inputTerms: string[],
  prisma: PrismaClient
): Promise<string[]> {
  let ids: string[] = [];
  if (inputTerms && inputTerms.length > 0) {
    const terms = [...inputTerms];
    const found = await prisma.artist.findMany({
      where: { name: { in: terms } },
      select: { id: true, name: true },
    });

    found.forEach((term) => {
      const idx = terms.indexOf(term.name);
      ids.push(term.id);
      terms.splice(idx, 1);
    });

    if (terms.length > 0) {
      const newArtists = await Promise.all(
        terms.map(async (name) => {
          const slug = await getUniqueSlug(prisma.artist, name);
          const artist = await prisma.artist.create({ data: { name, slug } });
          return artist.id;
        })
      );
      ids = ids.concat(newArtists);
    }
  }
  return ids;
}
