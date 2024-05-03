import { ObjectId } from 'mongodb';

import type { AugmentedContext } from '../models/types';

import { parseConnection } from './utils/collection';

const resolvers = {
  Show: {
    id(show: any) {
      return show._id;
    },
    artist(show: any, args: any, { Term }: AugmentedContext) {
      return Term.findOneById(show.artist);
    },
    venue(show: any, args: any, { Term }: AugmentedContext) {
      return Term.findOneById(show.venue);
    },
  },
  Query: {
    async shows(root: any, args: any, { Show, Term, Taxonomy }: AugmentedContext) {
      const { taxonomy, term, taxonomyId, termId, ...rest } = args;
      const connectionArgs = rest;

      if (taxonomy && term) {
        const taxId = (await Taxonomy.findOneBySlug(taxonomy))._id;
        const t = await Term.findOneByTermTaxonomy(term, taxId);
        if (t) {
          connectionArgs[taxonomy] = t._id;
        }
      } else if (taxonomyId && termId) {
        const slug = (await Taxonomy.findOneById(taxonomyId)).slug;
        connectionArgs[slug] = new ObjectId(String(termId));
      }

      return parseConnection(Show, connectionArgs);
    },

    async show(root: any, { id, slug }: any, { Show }: AugmentedContext) {
      if (id) {
        return Show.findOneById(id);
      }
      return Show.findOneBySlug(slug);
    },
  },
  Mutation: {
    async createShow(root: any, { input }: any, { Show }: AugmentedContext) {
      const id = await Show.insert(input);
      return Show.findOneById(id);
    },

    async updateShow(root: any, { id, input }: any, { Show }: AugmentedContext) {
      await Show.updateById(id, input);
      return Show.findOneById(id);
    },

    async removeShow(root: any, { ids }: any, { Show }: AugmentedContext) {
      return Promise.all(ids.map((id: string) => Show.removeById(id)))
        .then(() => true)
        .catch(() => false);
    },
  },
};

export default resolvers;
