/**
 * Loads rows by a unique column, asking for the values of one tick in one query, as Prisma batched
 * the findUnique calls of a tick. Resolvers that each load one row, such as a post's images or the
 * Apple Music data of a show's artists, then share a query.
 */
export function batchBy<TRow, TColumn extends keyof TRow & string>(
  column: TColumn,
  load: (values: string[]) => Promise<TRow[]>
) {
  let batch: Map<string, PromiseWithResolvers<TRow | null>[]> | undefined;

  async function run(requests: Map<string, PromiseWithResolvers<TRow | null>[]>) {
    try {
      const rows = new Map(
        (await load([...requests.keys()])).map((row) => [String(row[column]), row])
      );
      for (const [value, waiting] of requests) {
        for (const { resolve } of waiting) resolve(rows.get(value) ?? null);
      }
    } catch (error) {
      for (const waiting of requests.values()) {
        for (const { reject } of waiting) reject(error);
      }
    }
  }

  return (value: string): Promise<TRow | null> => {
    if (!batch) {
      const requests = new Map<string, PromiseWithResolvers<TRow | null>[]>();
      batch = requests;
      process.nextTick(() => {
        batch = undefined;
        run(requests);
      });
    }
    const request = Promise.withResolvers<TRow | null>();
    batch.set(value, [...(batch.get(value) ?? []), request]);
    return request.promise;
  };
}
