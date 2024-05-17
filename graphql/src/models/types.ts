import type { Db, Collection } from 'mongodb';

export interface ModelInterface {
  collection: Collection;
  insert: (args: any) => any;
  all: (args: any) => any;
  count: (args: any) => any;
}

export interface ModelContext {
  db: Db;
}

export interface FileInfo {
  fileName: string;
  destination: string;
}
