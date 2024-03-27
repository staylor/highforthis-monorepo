import type { ObjectId } from 'mongodb';

import Model from './Model';
import { getUniqueSlug } from './utils';
import type { ModelContext } from './types';

interface AllOptions {
  limit: number;
  offset: number;
  year: string;
  search: string;
}

interface VideoFilters {
  year?: number;
  title?: any;
  $text?: any;
}

export default class Video extends Model {
  public constructor(context: ModelContext) {
    super(context);

    this.collection = context.db.collection('video');
  }

  public all({ limit = 10, offset = 0, year = '', search = '' }: AllOptions): Promise<any> {
    const criteria: VideoFilters = {};
    if (year) {
      criteria.year = parseInt(year, 10);
    }
    if (search) {
      criteria.title = { $regex: new RegExp(search, 'i') };
    }

    return this.collection
      .find(criteria)
      .sort({ year: -1, position: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
  }

  public async insert(doc: any): Promise<ObjectId> {
    const docToInsert = {
      ...doc,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    docToInsert.slug = await getUniqueSlug(this.collection, docToInsert.title);
    const id = (await this.collection.insertOne(docToInsert)).insertedId;
    return id;
  }
}
