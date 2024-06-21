import bcrypt from 'bcrypt';
import type { Document } from 'mongodb';
import { ObjectId } from 'mongodb';
import type { UpdateUserInput } from 'types/graphql';

import Model from './Model';
import type { ModelContext } from './types';

const SALT_ROUNDS = 10;

export default class User extends Model {
  public constructor(context: ModelContext) {
    super(context);

    this.collection = context.db.collection('user');
  }

  public async all(args: any) {
    const { limit = 10, offset = 0 } = args;
    const criteria = this.parseCriteria(args);

    return this.collection
      .find(criteria, { hash: 0 } as any)
      .collation({ locale: 'en' })
      .sort({ name: 1 })
      .skip(offset)
      .limit(limit)
      .toArray();
  }

  public async insert(doc: Document): Promise<ObjectId> {
    const { password, ...fields } = doc;
    if (!fields.email || !password) {
      throw new Error('Email and Password are required.');
    }
    const exists = await this.count({ email: fields.email });
    if (exists) {
      throw new Error('Email already exists.');
    }
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const docToInsert = {
      roles: [],
      ...fields,
      hash,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const id = (await this.collection.insertOne(docToInsert)).insertedId;
    return id;
  }

  public async updateById(id: string, { password = null, ...fields }: UpdateUserInput) {
    const user = await this.findOneById(id);
    const docToUpdate: Document = { ...fields };
    if (fields.email !== user.email) {
      const exists = await this.count({ email: fields.email });
      if (exists) {
        throw new Error('Email already exists.');
      }
    }
    if (password) {
      docToUpdate.hash = await bcrypt.hash(password, SALT_ROUNDS);
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
