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

/**
 * The records on the other side of a join table: from the joins a record's query included, or
 * from `query` when it didn't include them
 */
export function resolveJoin<TJoin, TKey extends keyof TJoin>(
  included: TJoin[] | undefined,
  key: TKey,
  query: () => Promise<TJoin[]>
): TJoin[TKey][] | Promise<TJoin[TKey][]> {
  if (included) {
    return included.map((join) => join[key]);
  }
  return query().then((joins) => joins.map((join) => join[key]));
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
