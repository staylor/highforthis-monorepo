import Model from './Model';

export default class Podcast extends Model {
  public collection = this.context.db.collection('podcast');

  public async all(args: any) {
    const { limit = 10, offset = 0, order = 'DESC' } = args;
    const criteria = this.parseCriteria(args);

    return this.collection
      .find(criteria)
      .sort({ createdAt: order === 'ASC' ? 1 : -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
  }
}
