import prisma from '#/database';
import { getUniqueSlug } from '#/models/utils';

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
  // One at a time, so two new names can't claim the same slug
  for (const name of names.values()) {
    const artist =
      (await prisma.artist.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } },
        orderBy: { createdAt: 'asc' },
        select: { id: true },
      })) ??
      (await prisma.artist.create({
        data: { name, slug: await getUniqueSlug(prisma.artist, name) },
        select: { id: true },
      }));
    ids.push(artist.id);
  }
  return ids;
}
