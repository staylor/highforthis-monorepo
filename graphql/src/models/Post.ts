import type { Document } from 'mongodb';
import { ObjectId } from 'mongodb';
import type { PostStatus } from 'types/graphql';

import type { SearchCriteria } from './Model';
import Model from './Model';
import type { ModelContext } from './types';
import { getUniqueSlug } from './utils';

interface PostParams {
  status?: PostStatus;
  search?: string;
}

interface PostCriteria extends SearchCriteria {
  status?: PostStatus;
}

export default class Post extends Model {
  public constructor(context: ModelContext) {
    super(context);

    this.collection = context.db.collection('post');
  }

  protected parseCriteria(args: PostParams) {
    const { status = null, search = null } = args;
    const criteria: PostCriteria = {};
    if (status) {
      criteria.status = status;
    }
    if (search) {
      criteria.$text = { $search: search };
    }
    return criteria;
  }

  public async all(args: any) {
    const { limit = 10, offset = 0 } = args;
    const criteria = this.parseCriteria(args);

    return this.collection.find(criteria).sort({ date: -1 }).skip(offset).limit(limit).toArray();
  }

  public async insert(doc: Document): Promise<ObjectId> {
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

  public async updateById(id: string, doc: Document) {
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
