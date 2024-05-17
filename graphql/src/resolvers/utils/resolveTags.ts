import type Artist from '@/models/Artist';

export default async function resolveTags(inputTerms: string[], { Artist }: { Artist: Artist }) {
  let ids: string[] = [];
  if (inputTerms && inputTerms.length > 0) {
    const terms = [...inputTerms];
    const found = await Artist.collection
      .find(
        {
          name: { $in: terms },
        },
        { name: 1 } as any
      )
      .toArray();

    found.forEach((term: any) => {
      const idx = terms.indexOf(term.name);
      ids.push(term._id);
      terms.splice(idx, 1);
    });

    if (terms.length > 0) {
      const termIds = await Promise.all(
        terms.map(async (name) => {
          const id = await Artist.insert({ name });
          return id.toString();
        })
      );
      ids = ids.concat(termIds);
    }
  }
  return ids;
}
