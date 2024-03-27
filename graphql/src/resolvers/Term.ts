import type { AugmentedContext } from '../models/types';

import { parseConnection } from './utils/collection';
import resolveTags from './utils/resolveTags';

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

const placeFields = {
  categories: 'Category',
  crossStreets: 'Cross Street',
};

const neighborhoodId = '6344f94fe3562a0a05d5af8e';
const artistId = '5a3abf2b9865327e39cb44b2';
const venueId = '5a3ad64eacc532279a02743e';
const placeId = '634460bb862daa0e24273372';
const categoryId = '63449b2d17a6917114c8272c';
const crossStreetId = '63449b3717a6917114c8272d';

const handlePlace = async (data: any, { Taxonomy, Term }: AugmentedContext) => {
  if (String(data.taxonomy) === placeId) {
    await Promise.all(
      Object.entries(placeFields).map(async ([key, model]) => {
        if (data[key] && data[key].length > 0) {
          data[key] = await resolveTags(model, data[key], {
            Taxonomy,
            Term,
          });
        } else {
          data[key] = [];
        }
      })
    );
  }
};

const resolvers = {
  Term: {
    __resolveType(entity: any) {
      const str = String(entity.taxonomy);
      switch (str) {
        case artistId:
          return 'Artist';
        case venueId:
          return 'Venue';
        case placeId:
          return 'Place';
        case categoryId:
          return 'Category';
        case crossStreetId:
          return 'CrossStreet';
        case neighborhoodId:
          return 'Neighborhood';
      }
      return null;
    },
  },
  Artist: termFields,
  Venue: termFields,
  Category: termFields,
  CrossStreet: termFields,
  Neighborhood: termFields,
  Place: {
    ...termFields,
    neighborhood(term: any, args: any, { Term }: AugmentedContext) {
      return term.neighborhood ? Term.findOneById(term.neighborhood) : null;
    },
    categories(term: any, args: any, { Term }: AugmentedContext) {
      return term.categories ? Term.findByIds(term.categories) : [];
    },
    crossStreets(term: any, args: any, { Term }: AugmentedContext) {
      return term.crossStreets ? Term.findByIds(term.crossStreets) : [];
    },
  },
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

    async places(root: any, args: any, { Term, Place }: AugmentedContext) {
      const { categories, crossStreets, neighborhoods, order, ...rest } = args;
      const connectionArgs = rest;
      connectionArgs.taxonomy = 'place';

      const defaultSort = { updatedAt: -1 };

      if (order) {
        switch (order) {
          case 'A_TO_Z':
            connectionArgs.sort = { name: 1 };
            break;
          case 'Z_TO_A':
            connectionArgs.sort = { name: -1 };
            break;
          case 'UPDATE_ASC':
            connectionArgs.sort = { updatedAt: 1 };
            break;
          default:
            connectionArgs.sort = defaultSort;
            break;
        }
      } else {
        connectionArgs.sort = defaultSort;
      }

      if (neighborhoods) {
        const terms = await Term.filterByTerms(neighborhoods).toArray();
        connectionArgs.neighborhoods = terms.map((t: any) => t._id);
      }
      if (categories) {
        const terms = await Term.filterByTerms(categories).toArray();
        connectionArgs.categories = terms.map((t: any) => t._id);
      }
      if (crossStreets) {
        const terms = await Term.filterByTerms(crossStreets).toArray();
        connectionArgs.crossStreets = terms.map((t: any) => t._id);
      }
      return parseConnection(Place, connectionArgs);
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
      await handlePlace(data, { Term, Taxonomy });
      const id = await Term.insert(data);
      return Term.findOneById(id);
    },

    async updateTerm(root: any, { id, input }: any, { Term, Taxonomy }: AugmentedContext) {
      const data = { ...input };
      await handlePlace(data, { Term, Taxonomy });
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
