import type { AugmentedContext } from '../models/types';

import { parseConnection } from './utils/collection';

const termFields = {
  id(term: any) {
    return term._id;
  },
  taxonomy(term: any, args: any, { Taxonomy }: AugmentedContext) {
    return Taxonomy.findOneById(term.taxonomy);
  },
  featuredMedia(term: any, args: any, { Media }: AugmentedContext) {
    return Media.findByIds(term.featuredMedia || []);
  },
};

const artistId = '5a3abf2b9865327e39cb44b2';
const venueId = '5a3ad64eacc532279a02743e';

const resolvers = {
  Term: {
    __resolveType(entity: any) {
      const str = String(entity.taxonomy);
      switch (str) {
        case artistId:
          return 'Artist';
        case venueId:
          return 'Venue';
      }
      return null;
    },
  },
  Artist: termFields,
  Venue: termFields,
  Query: {
    async terms(root: any, args: any, { Term, Taxonomy }: AugmentedContext) {
      const connection = await parseConnection(Term, args);
      const { taxonomyId, taxonomy } = args;
      if (taxonomyId) {
        connection.taxonomy = await Taxonomy.findOneById(taxonomyId);
      } else if (taxonomy) {
        connection.taxonomy = await Taxonomy.findOneBySlug(taxonomy);
      }
      return connection;
    },

    async term(root: any, { id, slug, taxonomy }: any, { Term, Taxonomy }: AugmentedContext) {
      if (id) {
        return Term.findOneById(id);
      }
      const taxId = (await Taxonomy.findOneBySlug(taxonomy))._id;
      return Term.findOneByTermTaxonomy(slug, taxId);
    },
  },
  Mutation: {
    async createTerm(root: any, { input }: any, { Term, Taxonomy }: AugmentedContext) {
      const data = { ...input };
      const id = await Term.insert(data);
      return Term.findOneById(id);
    },

    async updateTerm(root: any, { id, input }: any, { Term, Taxonomy }: AugmentedContext) {
      const data = { ...input };
      await Term.updateById(id, data);
      return Term.findOneById(id);
    },

    async removeTerm(root: any, { ids }: any, { Term }: AugmentedContext) {
      return Promise.all(ids.map((id: string) => Term.removeById(id)))
        .then(() => true)
        .catch(() => false);
    },
  },
};

export default resolvers;
