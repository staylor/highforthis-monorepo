import { ObjectId } from 'mongodb';

import Model from './Model';
import type { ModelContext } from './types';
import { getUniqueSlug } from './utils';

function convertEntityData(entityMap: any): any[] {
  return entityMap.map((entity: any) => {
    const normalized: any = {};
    if (entity.data.type === 'EMBED') {
      const { type, url, html } = entity.data;
      normalized.data = { type, url, html };
    } else if (entity.data.type === 'LINK') {
      const { type, href, target } = entity.data;
      normalized.data = { type, href, target };
    } else if (entity.data.type === 'IMAGE') {
      const { type, imageId, size } = entity.data;
      normalized.data = { type, size };
      normalized.data.imageId = new ObjectId(imageId);
    } else if (entity.data.type === 'VIDEO') {
      const { type, videoId } = entity.data;
      normalized.data = { type };
      normalized.data.videoId = new ObjectId(videoId);
    } else {
      normalized.data = entity.data;
    }
    const { type, mutability } = entity;
    normalized.type = type;
    normalized.mutability = mutability;
    return normalized;
  });
}

export default class Post extends Model {
  public constructor(context: ModelContext) {
    super(context);

    this.collection = context.db.collection('post');
  }

  public all({ limit = 10, offset = 0, status = null, search = null }) {
    const criteria: any = {};
    if (status) {
      criteria.status = status;
    }
    if (search) {
      criteria.$text = { $search: search };
    }

    return this.collection.find(criteria).sort({ date: -1 }).skip(offset).limit(limit).toArray();
  }

  public async insert(doc: any): Promise<ObjectId> {
    if (!doc.title) {
      throw new Error('Post requires a title.');
    }
    const slug = await getUniqueSlug(this.collection, doc.title);
    const featuredMedia = (doc.featuredMedia || []).map((id: string) => new ObjectId(id));
    const artists = (doc.artists || []).map((id: string) => new ObjectId(id));
    const now = Date.now();

    const docToInsert = {
      status: 'DRAFT',
      ...doc,
      slug,
      featuredMedia,
      artists,
      date: doc.date || now,
      createdAt: now,
      updatedAt: now,
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
    docToUpdate.artists = (docToUpdate.artists || []).map(
      (artistId: string) => new ObjectId(artistId)
    );
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
