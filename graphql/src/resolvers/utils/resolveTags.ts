import type { AugmentedContext } from '@/models/types';

export default async function resolveTags(
  taxonomyName: string,
  inputTerms: string[],
  { Taxonomy, Term }: AugmentedContext
) {
  const record = await Taxonomy.collection.findOne({ name: taxonomyName });
  const taxonomy = record._id;
  let ids: string[] = [];
  if (inputTerms && inputTerms.length > 0) {
    const terms = [...inputTerms];
    const found = await Term.collection
      .find(
        {
          taxonomy,
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
      const termIds = await Promise.all(terms.map((name) => Term.insert({ name, taxonomy })));
      ids = ids.concat(termIds);
    }
  }
  return ids;
}
