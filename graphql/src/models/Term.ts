import type { Collection } from 'mongodb';
import { ObjectId } from 'mongodb';

import Model from './Model';
import { getUniqueSlug } from './utils';
import type { ModelContext } from './types';

export default class Term extends Model {
  private taxonomyCollection: Collection;

  public constructor(context: ModelContext) {
    super(context);

    this.taxonomyCollection = context.db.collection('taxonomy');
    this.collection = context.db.collection('term');
  }

  public findTaxonomyBySlug(slug: string) {
    return this.taxonomyCollection.findOne({ slug });
  }

  public findOneByTermTaxonomy(slug: string, taxonomy: string) {
    return this.collection.findOne({ slug, taxonomy });
  }

  public findByTermTaxonomy(slug: string, taxonomy: string) {
    return this.collection.find({ slug, taxonomy });
  }

  public filterByTerms(slugs: string[]) {
    return this.collection.find({ slug: { $in: slugs } });
  }

  public async count(args: any = {}) {
    const criteria: any = { ...args };
    if (criteria.taxonomy) {
      const tax = await this.findTaxonomyBySlug(criteria.taxonomy);
      if (tax) {
        criteria.taxonomy = tax._id;
      }
    } else if (criteria.taxonomyId) {
      criteria.taxonomy = criteria.taxonomyId;
      delete criteria.taxonomyId;
    }
    delete criteria.search;
    if (args.search) {
      criteria.$text = { $search: args.search };
    }
    return this.collection.countDocuments(criteria);
  }

  public async all({ limit = 10, offset = 0, taxonomyId = '', taxonomy = '', search = '' }) {
    const criteria: any = {};
    if (taxonomy) {
      const tax = await this.findTaxonomyBySlug(taxonomy);
      if (tax) {
        criteria.taxonomy = tax._id;
      }
    } else if (taxonomyId) {
      criteria.taxonomy = taxonomyId;
    }
    if (search) {
      criteria.$text = { $search: search };
    }

    return this.collection.find(criteria).sort({ name: 1 }).skip(offset).limit(limit).toArray();
  }

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
