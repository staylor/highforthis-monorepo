export async function removeEntities(
  delegate: { deleteMany: (args: any) => Promise<unknown> },
  ids: any
): Promise<boolean> {
  try {
    await delegate.deleteMany({ where: { id: { in: ids as string[] } } });
    return true;
  } catch {
    return false;
  }
}

export function resolveJoin(
  parent: Record<string, any>,
  field: string,
  key: string,
  query: () => Promise<any[]>
) {
  if (field in parent) {
    const value = parent[field];
    return Array.isArray(value) ? value.map((r: any) => r[key] ?? r) : value;
  }
  return query().then((records: any[]) => records.map((r: any) => r[key]));
}

export function resolveType(typeMap: Record<string, string>, fallback?: string) {
  return (obj: Record<string, any>) => typeMap[obj.type] ?? fallback;
}

export function timestampResolver(field: string) {
  return (obj: Record<string, any>) => new Date(obj[field] as string).getTime();
}
