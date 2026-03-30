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

export function resolveJoin<T extends Record<string, unknown>>(
  parent: T,
  field: string,
  key: string,
  query: () => Promise<Record<string, unknown>[]>
) {
  if (field in parent) {
    const value = parent[field];
    return Array.isArray(value)
      ? value.map((r) => (r as Record<string, unknown>)[key] ?? r)
      : value;
  }
  return query().then((records) => records.map((r) => r[key]));
}

export function resolveType(typeMap: Record<string, string>, fallback?: string) {
  return (obj: Record<string, unknown>) => typeMap[obj.type as string] ?? fallback;
}

export function timestampResolver(field: string) {
  return (obj: Record<string, unknown>) => new Date(obj[field] as string).getTime();
}
