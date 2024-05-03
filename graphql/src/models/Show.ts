import Model from './Model';
import type { ModelContext } from './types';

enum ShowOrder {
  ASC,
  DESC,
}

interface ShowParams {
  latest?: boolean;
  attended?: boolean;
  artist?: string;
  venue?: string;
  search?: string;
  order?: ShowOrder;
  offset?: number;
  limit?: number;
}

interface ShowFilters {
  date?: any;
  attended?: boolean;
  artist?: string;
  venue?: string;
  $text?: any;
}

export default class Show extends Model {
  public constructor(context: ModelContext) {
    super(context);

    this.collection = context.db.collection('show');
  }

  public count(params: ShowParams): Promise<number> {
    const criteria = this.parseCriteria(params);
    return this.collection.countDocuments(criteria);
  }

  public async all({
    order = ShowOrder.ASC,
    offset = 0,
    limit = 10,
    ...params
  }: ShowParams): Promise<any[]> {
    const criteria = this.parseCriteria(params);

    return this.collection
      .find(criteria)
      .sort({ date: order === ShowOrder.ASC ? 1 : -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
  }

  private parseCriteria({
    latest = false,
    attended = false,
    artist = '',
    venue = '',
    search = '',
  }) {
    const criteria: ShowFilters = {};
    if (attended) {
      criteria.attended = true;
    } else if (latest) {
      criteria.date = { $gte: Date.now() };
    }
    if (artist) {
      criteria.artist = artist;
    }
    if (venue) {
      criteria.venue = venue;
    }
    if (search) {
      criteria.$text = { $search: search };
    }
    return criteria;
  }
}
