import DataLoader from 'dataloader';
import type { Collection, Document } from 'mongodb';
import { ObjectId } from 'mongodb';

import type { ModelContext } from './types';

export interface SearchCriteria {
  $text?: { $search: string };
}

async function findByIds(collection: Collection, ids: readonly any[]) {
  return collection
    .find({
      _id: {
        $in: ids.map((id: any) =>
          // a result of settings not having a hexed ID - this is legacy garbage
          id instanceof ObjectId ? id : id.match(/0-9/) ? new ObjectId(id) : id
        ),
      },
    })
    .toArray()
    .then((docs) => {
      const idMap: Record<string, Document> = {};
      // make a map of documents keyed by id (string)
      docs.forEach((d) => {
        idMap[d._id.toString()] = d;
      });
      // return the documents in the order they were requested
      return ids.map((id) => idMap[id]);
    });
}

export default abstract class Model {
  public abstract collection: Collection;

  protected context: ModelContext;

  protected loader: DataLoader<string, any>;

  public constructor(context: ModelContext) {
    this.context = context;
    this.loader = new DataLoader((ids) => findByIds(this.collection, ids));
  }

  public view(name: string) {
    return this.context.db.collection(name);
  }

  public findOneById(id: any) {
    return this.loader.load(id);
  }

  public findByIds(ids: string[]) {
    return this.loader.loadMany(ids);
  }

  public findOneBySlug(slug: string) {
    return this.collection.findOne({
      slug,
    });
  }

  public lastAdded() {
    return this.collection.findOne({}, { sort: { createdAt: -1 } });
  }

  protected parseCriteria(args: any) {
    const { search = '' } = args;
    const criteria: SearchCriteria = {};
    if (search) {
      criteria.$text = { $search: search };
    }
    return criteria as any;
  }

  public async all(args: any) {
    const { limit = 10, offset = 0 } = args;
    const criteria = this.parseCriteria(args);

    return this.collection.find(criteria).skip(offset).limit(limit).toArray();
  }

  public async count(args: any = {}): Promise<number> {
    const criteria = this.parseCriteria(args);
    return this.collection.countDocuments(criteria);
  }

  public async insert(doc: Document): Promise<ObjectId> {
    const now = Date.now();
    const docToInsert = {
      ...doc,
      createdAt: now,
      updatedAt: now,
    };
    const id = (await this.collection.insertOne(docToInsert)).insertedId;
    return id;
  }

  public async updateById(id: string, doc: Document) {
    const ret = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...doc,
          updatedAt: Date.now(),
        },
      }
    );
    this.loader.clear(id);
    return ret;
  }

  public async removeById(id: string) {
    const ret = await this.collection.deleteOne({ _id: new ObjectId(id) });
    this.loader.clear(id);
    return ret;
  }
}
