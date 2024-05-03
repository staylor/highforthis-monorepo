import Entity from './Entity';
import type { ModelContext } from './types';

export default class Artist extends Entity {
  public constructor(context: ModelContext) {
    super(context);

    this.collection = context.db.collection('artist');
  }
}
