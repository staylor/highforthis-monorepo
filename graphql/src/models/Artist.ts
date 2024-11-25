import Entity from './Entity';

export default class Artist extends Entity {
  public collection = this.context.db.collection('artist');
}
