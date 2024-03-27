import type { Db } from 'mongodb';

declare global {
  export interface ModelInstanceMap<T> {
    [key: string]: T;
  }

  export type Context<T> = {
    db: Db;
  } & ModelInstanceMap<T>;
}
