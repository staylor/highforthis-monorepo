import Term from './Term';

export default class Place extends Term {
  public async all({
    limit = 10,
    offset = 0,
    taxonomyId = '',
    taxonomy = '',
    categories = null,
    crossStreets = null,
    neighborhoods = null,
    sort = {},
    search = '',
  }) {
    const criteria: any = {};
    if (taxonomy) {
      const tax = await this.findTaxonomyBySlug(taxonomy);
      if (tax) {
        criteria.taxonomy = tax._id;
      }
    } else if (taxonomyId) {
      criteria.taxonomy = taxonomyId;
    }
    if (neighborhoods) {
      criteria.neighborhood = { $in: neighborhoods };
    }
    if (categories) {
      criteria.categories = { $in: categories };
    }
    if (crossStreets) {
      criteria.crossStreets = { $in: crossStreets };
    }
    if (search) {
      criteria.$text = { $search: search };
    }
    return this.collection.find(criteria).sort(sort).skip(offset).limit(limit).toArray();
  }
}
