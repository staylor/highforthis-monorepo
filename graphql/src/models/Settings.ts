import Model from './Model';

export default class Settings extends Model {
  public collection = this.context.db.collection('settings');
}
