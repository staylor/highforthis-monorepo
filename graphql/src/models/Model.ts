import type { Collection } from 'mongodb';
import { ObjectId } from 'mongodb';
import DataLoader from 'dataloader';

import type { ModelContext } from './types';

async function findByIds(collection: Collection, ids: readonly string[]): Promise<any> {
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
      const idMap: any = {};
      // make a map of documents keyed by id (string)
      docs.forEach((d) => {
        idMap[d._id.toString()] = d;
      });
      // return the documents in the order they were requested
      return ids.map((id) => idMap[id]);
    });
}

export default class Model {
  // @ts-ignore
  public collection: Collection;

  protected context: any;

  protected loader: DataLoader<string, any>;

  public constructor(context: ModelContext) {
    this.context = context;
    this.loader = new DataLoader((ids) => findByIds(this.collection, ids));
  }

  public findOneById(id: string) {
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

  public all({ limit = 10, offset = 0 }: any) {
    const criteria = {};

    return this.collection.find(criteria).skip(offset).limit(limit).toArray();
  }

  public count(args: any = {}): Promise<number> {
    const criteria = { ...args };
    delete criteria.search;
    if (args.search) {
      criteria.$text = { $search: args.search };
    }
    return this.collection.countDocuments(criteria);
  }

  public async insert(doc: any): Promise<ObjectId> {
    const now = Date.now();
    const docToInsert = {
      ...doc,
      createdAt: now,
      updatedAt: now,
    };
    const id = (await this.collection.insertOne(docToInsert)).insertedId;
    return id;
  }

  public async updateById(id: string, doc: any) {
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
