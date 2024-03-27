import type { ObjectId } from 'mongodb';

import Model from './Model';
import { getUniqueSlug } from './utils';
import type { ModelContext } from './types';

export default class Taxonomy extends Model {
  public constructor(context: ModelContext) {
    super(context);

    this.collection = context.db.collection('taxonomy');
  }

  public all(): Promise<any[]> {
    return this.collection.find({}).sort({ name: 1 }).toArray();
  }

  public async insert(doc: any): Promise<ObjectId> {
    const slug = await getUniqueSlug(this.collection, doc.name);
    const docToInsert = {
      ...doc,
      slug,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const id = (await this.collection.insertOne(docToInsert)).insertedId;
    return id;
  }
}
