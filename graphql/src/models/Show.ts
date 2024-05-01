import Model from './Model';
import type { ModelContext } from './types';

interface ShowFilters {
  date?: any;
  artist?: string;
  venue?: string;
  $text?: any;
}

export default class Show extends Model {
  public constructor(context: ModelContext) {
    super(context);

    this.collection = context.db.collection('show');
  }

  public count({ latest = false, artist = '', venue = '', search = '' }): Promise<number> {
    const criteria: ShowFilters = {};
    if (latest) {
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
    return this.collection.countDocuments(criteria);
  }

  public async all({
    limit = 10,
    offset = 0,
    latest = false,
    order = 'ASC',
    artist = '',
    venue = '',
    search = '',
  }): Promise<any[]> {
    const criteria: ShowFilters = {};
    if (latest) {
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

    return this.collection
      .find(criteria)
      .sort({ date: order === 'ASC' ? 1 : -1, 'artist.name': 1 })
      .skip(offset)
      .limit(limit)
      .toArray();
  }
}
