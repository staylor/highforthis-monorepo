import fs from 'node:fs';
import path from 'node:path';

import { ObjectId } from 'mongodb';

import type { FileInfo, ModelContext } from './types';
import type { SearchCriteria } from './Model';
import Model from './Model';

const deleteFile = (file: string): Promise<void> =>
  new Promise((resolve) => {
    fs.unlink(file, (err) => {
      if (err) {
        console.log(err);
      }
      resolve();
    });
  });

interface MediaParams {
  mimeType?: string;
  search?: string;
  type?: string;
}

interface MediaCriteria extends SearchCriteria {
  type?: string;
  mimeType?: string;
}

export default class Media extends Model {
  public constructor(context: ModelContext) {
    super(context);

    this.collection = context.db.collection('media');
  }

  protected parseCriteria(args: MediaParams) {
    const { type = null, mimeType = null, search = null } = args;
    const criteria: MediaCriteria = {};
    if (type) {
      criteria.type = type;
    }
    if (mimeType) {
      criteria.mimeType = mimeType;
    }
    if (search) {
      criteria.$text = { $search: search };
    }
    return criteria;
  }

  public async all(args: any) {
    const { limit = 10, offset = 0 } = args;
    const criteria = this.parseCriteria(args);

    return this.collection
      .find(criteria)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
  }

  public async removeById(id: string) {
    const media = await this.loader.load(id);
    const ret = this.collection.deleteOne({ _id: new ObjectId(id) });
    this.loader.clear(id);
    const uploadsDir = path.resolve(
      path.join(__dirname, '../../public/uploads', media.destination)
    );
    if (media.type === 'image' && media.crops.length > 0) {
      await Promise.all(
        media.crops.map((crop: FileInfo) => deleteFile(`${uploadsDir}/${crop.fileName}`))
      );
    } else if (media.type === 'audio' && media.images.length > 0) {
      await Promise.all(
        media.images.map((image: FileInfo) => deleteFile(`${uploadsDir}/${image.fileName}`))
      );
    }
    await deleteFile(`${uploadsDir}/${media.fileName}`);
    return ret;
  }
}
