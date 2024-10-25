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
  year?: number;
}

interface ShowCriteria {
  date?: { $gte: number; $lte?: number };
  attended?: boolean;
  artists?: string;
  venue?: string;
  title?: { $regex: RegExp };
}

export default class Show extends Model {
  public constructor(context: ModelContext) {
    super(context);

    this.collection = context.db.collection('show');
  }

  public async all({ order = ShowOrder.ASC, offset = 0, limit = 10, ...params }: ShowParams) {
    const criteria = this.parseCriteria(params);

    return this.collection
      .find(criteria)
      .sort({ date: order === ShowOrder.ASC ? 1 : -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
  }

  protected parseCriteria({
    latest = false,
    attended = false,
    artist = '',
    venue = '',
    search = '',
    year = undefined,
  }: ShowParams) {
    const criteria: ShowCriteria = {};
    if (attended) {
      criteria.attended = true;
    } else if (latest) {
      criteria.date = { $gte: Date.now() };
    }
    if (artist) {
      criteria.artists = artist;
    }
    if (venue) {
      criteria.venue = venue;
    }
    if (year) {
      const startDate = Date.parse(`${year}-01-01T00:00:00Z`);
      const endDate = Date.parse(`${year + 1}-01-01T00:00:00Z`);
      criteria.date = {
        $gte: startDate,
        $lte: endDate,
      };
    }
    if (search) {
      // TODO: can't search relations right now since artists
      //   and venues are references, not text
      criteria.title = { $regex: new RegExp(search, 'i') };
    }
    return criteria;
  }

  public async stats(entityType: string) {
    let docs = [];
    if (entityType === 'artist') {
      docs = await this.view('showArtistStats').find().toArray();
    } else {
      docs = await this.view('showVenueStats').find().toArray();
    }
    // add type to entity to resolve GraphQL union properly
    return docs.map(({ entity, ...data }) => ({
      ...data,
      entity: { ...entity, type: entityType },
    }));
  }
}
