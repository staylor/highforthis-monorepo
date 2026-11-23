import { GraphQLError } from 'graphql';
import { inList, type AnyTable } from 'remix/data-table';
import type { z } from 'zod';

import db from '#/database/db';

/** An error for something the request got wrong, which isn't the server's failure */
export const badInput = (message: string) =>
  new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT' } });

/**
 * A mutation's input as its schema reads it. Input the schema turns down is answered with what's
 * wrong in each field.
 */
export function parseInput<TSchema extends z.ZodType>(
  schema: TSchema,
  input: unknown
): z.output<TSchema> {
  const result = schema.safeParse(input);
  if (result.success) {
    return result.data;
  }
  const problems = result.error.issues.map(({ path, message }) =>
    path.length ? `${path.join('.')}: ${message}` : message
  );
  throw badInput(`Invalid input (${problems.join('; ')})`);
}

interface DeleteDelegate {
  deleteMany: (args: { where: { id: { in: string[] } } }) => Promise<unknown>;
}

export async function removeEntities(
  delegate: DeleteDelegate,
  ids: (string | null)[]
): Promise<boolean> {
  try {
    await delegate.deleteMany({ where: { id: { in: ids.filter(Boolean) as string[] } } });
    return true;
  } catch {
    return false;
  }
}

/** Deletes the rows of a remix/data-table table that have these IDs, answering whether it could */
export async function removeRows(table: AnyTable, ids: (string | null)[]): Promise<boolean> {
  try {
    await db.deleteMany(table, { where: inList('id', ids.filter(Boolean)) });
    return true;
  } catch {
    return false;
  }
}

/**
 * The records on the other side of a join table, in the join table's order: from the joins a
 * record's query included, or from `query` when it didn't include them. A join's foreign key
 * means it has its record, which a loaded relation types as possibly missing.
 */
export function resolveJoin<TJoin, TKey extends keyof TJoin>(
  included: TJoin[] | undefined,
  key: TKey,
  query: () => Promise<TJoin[]>
): NonNullable<TJoin[TKey]>[] | Promise<NonNullable<TJoin[TKey]>[]> {
  const records = (joins: TJoin[]) =>
    joins
      .map((join) => join[key])
      .filter((record): record is NonNullable<TJoin[TKey]> => record !== null);
  return included ? records(included) : query().then(records);
}

/** Resolves an abstract type from a record's `type`, or `fallback` for one `typeMap` doesn't name */
export function resolveType<const TName extends string>(
  typeMap: Record<string, TName>,
  fallback: TName
) {
  return (record: { type?: string | null }): TName => typeMap[record.type ?? ''] ?? fallback;
}

/** Resolves a date as milliseconds since the epoch */
export function timestampResolver<TField extends string>(field: TField) {
  return (record: Record<TField, Date>) => new Date(record[field]).getTime();
}
