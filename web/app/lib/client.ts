// The address each request came from, as the Node server saw it: on Railway, the first address
// in the edge's X-Forwarded-For. Requests built in tests have none.

const addresses = new WeakMap<Request, string>();

export function rememberClientAddress(request: Request, address: string): void {
  addresses.set(request, address);
}

/** The client's address, or null for a request that didn't come through the Node server. */
export function clientAddress(request: Request): string | null {
  return addresses.get(request) ?? null;
}
