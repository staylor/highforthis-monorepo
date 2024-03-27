import Model from './Model';
import type { ModelContext } from './types';

interface PodcastFilters {
  $text?: any;
}

export default class Podcast extends Model {
  public constructor(context: ModelContext) {
    super(context);

    this.collection = context.db.collection('podcast');
  }

  public count({ search = '' }) {
    const criteria: PodcastFilters = {};
    if (search) {
      criteria.$text = { $search: search };
    }
    return this.collection.countDocuments(criteria);
  }

  public async all({ limit = 10, offset = 0, order = 'DESC', search = '' }) {
    const criteria: PodcastFilters = {};
    if (search) {
      criteria.$text = { $search: search };
    }

    return this.collection
      .find(criteria)
      .sort({ createdAt: order === 'ASC' ? 1 : -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
  }
}
