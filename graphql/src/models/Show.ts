import type { Document } from 'mongodb';

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
  artists?: string;
  venue?: string;
  title?: any;
}

export default class Show extends Model {
  public constructor(context: ModelContext) {
    super(context);

    this.collection = context.db.collection('show');
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

  protected parseCriteria({
    latest = false,
    attended = false,
    artist = '',
    venue = '',
    search = '',
  }: ShowParams) {
    const criteria: ShowFilters = {};
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
    if (search) {
      // TODO: can't search relations right now since artists
      //   and venues are references, not text
      criteria.title = { $regex: new RegExp(search, 'i') };
    }
    return criteria;
  }

  public async stats(entityType: string) {
    const lookupTable = `${entityType}_info`;
    const pipeline: Document[] = [
      // shows with attended: true
      {
        $match: {
          attended: true,
        },
      },
    ];
    if (entityType === 'artist') {
      // artists is an array
      pipeline.push({
        $unwind: '$artists',
      });
    }
    pipeline.push(
      // group by _id
      {
        $group: {
          _id: entityType === 'artist' ? '$artists' : '$venue',
          count: {
            $sum: 1,
          },
        },
      },
      // lookup entity in foreign table
      {
        $lookup: {
          from: entityType,
          localField: '_id',
          foreignField: '_id',
          as: lookupTable,
        },
      },
      // return entity with result
      {
        $project: {
          entity: {
            $arrayElemAt: [`$${lookupTable}`, 0],
          },
          count: 1,
        },
      },
      // reverse sort
      {
        $sort: {
          count: -1,
          'entity.name': 1,
        },
      }
    );
    const docs = await this.collection.aggregate(pipeline).toArray();
    // add type to entity to resolve GraphQL union properly
    return docs.map(({ entity, ...data }) => ({
      ...data,
      entity: { ...entity, type: entityType },
    }));
  }
}
