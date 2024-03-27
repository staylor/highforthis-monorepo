import Model from './Model';
import type { ModelContext } from './types';

export default class Settings extends Model {
  public constructor(context: ModelContext) {
    super(context);

    this.collection = context.db.collection('settings');
  }
}
