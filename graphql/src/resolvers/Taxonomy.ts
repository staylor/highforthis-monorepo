import type { AugmentedContext } from '../models/types';

import { parseConnection } from './utils/collection';

const resolvers = {
  Taxonomy: {
    id(taxonomy: any) {
      return taxonomy._id;
    },
  },
  Query: {
    taxonomies(root: any, args: any, { Taxonomy }: AugmentedContext) {
      return parseConnection(Taxonomy, { first: 100 });
    },

    taxonomy(root: any, { id, slug }: any, { Taxonomy }: AugmentedContext) {
      if (id) {
        return Taxonomy.findOneById(id);
      }
      return Taxonomy.findOneBySlug(slug);
    },
  },
  Mutation: {
    async createTaxonomy(root: any, { input }: any, { Taxonomy }: AugmentedContext) {
      const id = await Taxonomy.insert(input);
      return Taxonomy.findOneById(id);
    },

    async updateTaxonomy(root: any, { id, input }: any, { Taxonomy }: AugmentedContext) {
      await Taxonomy.updateById(id, input);
      return Taxonomy.findOneById(id);
    },

    async removeTaxonomy(root: any, { ids }: any, { Taxonomy }: AugmentedContext) {
      return Promise.all(ids.map((id: string) => Taxonomy.removeById(id)))
        .then(() => true)
        .catch(() => false);
    },
  },
};

export default resolvers;
