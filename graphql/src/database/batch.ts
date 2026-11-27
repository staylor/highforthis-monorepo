/**
 * Loads rows by a unique column, asking for the values of one tick in one query, as Prisma batched
 * the findUnique calls of a tick. Resolvers that each load one row, such as a post's images or the
 * Apple Music data of a show's artists, then share a query.
 */
export function batchBy<TRow, TColumn extends keyof TRow & string>(
  column: TColumn,
  load: (values: string[]) => Promise<TRow[]>
) {
  type Requests = Map<string, PromiseWithResolvers<TRow | null>>;
  let batch: Requests | undefined;

  async function run(requests: Requests) {
    try {
      const rows = new Map(
        (await load([...requests.keys()])).map((row) => [String(row[column]), row])
      );
      for (const [value, request] of requests) {
        request.resolve(rows.get(value) ?? null);
      }
    } catch (error) {
      for (const request of requests.values()) {
        request.reject(error);
      }
    }
  }

  return (value: string): Promise<TRow | null> => {
    if (!batch) {
      const requests: Requests = new Map();
      batch = requests;
      process.nextTick(() => {
        batch = undefined;
        run(requests);
      });
    }
    let request = batch.get(value);
    if (!request) {
      request = Promise.withResolvers<TRow | null>();
      batch.set(value, request);
    }
    return request.promise;
  };
}
