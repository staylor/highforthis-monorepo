import type { EntityParams, EntityCriteria } from './Entity';
import Entity from './Entity';

export default class Venue extends Entity {
  public collection = this.context.db.collection('venue');

  protected parseCriteria(params: EntityParams) {
    const criteria: EntityCriteria = {};
    const { filtered = false, search = '' } = params;
    if (search) {
      criteria.name = { $regex: new RegExp(search, 'i') };
    }
    if (filtered) {
      criteria.excludeFromSearch = { $in: [null, false] };
      criteria.permanentlyClosed = { $in: [null, false] };
    }
    return criteria;
  }
}
