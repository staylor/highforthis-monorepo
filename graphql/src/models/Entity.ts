import { ObjectId } from 'mongodb';

import Model from './Model';
import { getUniqueSlug } from './utils';

export default class Entity extends Model {
  public async insert(doc: any): Promise<ObjectId> {
    const slug = await getUniqueSlug(this.collection, doc.name);
    const featuredMedia = (doc.featuredMedia || []).map((id: string) => new ObjectId(id));
    const docToInsert = {
      ...doc,
      slug,
      featuredMedia,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const id = (await this.collection.insertOne(docToInsert)).insertedId;
    return id;
  }

  public async updateById(id: string, doc: any) {
    const docToUpdate = { ...doc };
    if (typeof docToUpdate.featuredMedia !== 'undefined') {
      docToUpdate.featuredMedia = (docToUpdate.featuredMedia || []).map(
        (mediaId: string) => new ObjectId(mediaId)
      );
    }
    const ret = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...docToUpdate,
          updatedAt: Date.now(),
        },
      }
    );
    this.loader.clear(id);
    return ret;
  }
}
