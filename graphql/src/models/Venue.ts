import type { EntityParams, EntityCriteria } from './Entity';
import Entity from './Entity';
import type { ModelContext } from './types';

export default class Venue extends Entity {
  public constructor(context: ModelContext) {
    super(context);

    this.collection = context.db.collection('venue');
  }

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
