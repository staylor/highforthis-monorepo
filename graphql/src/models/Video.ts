import type { Document, ObjectId } from 'mongodb';

import Model from './Model';
import type { ModelContext } from './types';
import { getUniqueSlug } from './utils';

interface VideoParams {
  year?: string;
  search?: string;
}

interface AllOptions extends VideoParams {
  limit?: number;
  offset?: number;
}

interface VideoCriteria {
  year?: number;
  title?: { $regex: RegExp };
}

export default class Video extends Model {
  public constructor(context: ModelContext) {
    super(context);

    this.collection = context.db.collection('video');
  }

  protected parseCriteria(args: VideoParams) {
    const { year = '', search = '' } = args;
    const criteria: VideoCriteria = {};
    if (year) {
      criteria.year = parseInt(year, 10);
    }
    if (search) {
      criteria.title = { $regex: new RegExp(search, 'i') };
    }
    return criteria;
  }

  public all(args: AllOptions) {
    const { limit = 10, offset = 0 } = args;
    const criteria = this.parseCriteria(args);

    return this.collection
      .find(criteria)
      .sort({ year: -1, position: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
  }

  public async insert(doc: Document): Promise<ObjectId> {
    const docToInsert: Document = {
      ...doc,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    docToInsert.slug = await getUniqueSlug(this.collection, docToInsert.title);
    const id = (await this.collection.insertOne(docToInsert)).insertedId;
    return id;
  }
}
