import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const contextKeys = [
  Symbol.for('highforthis.web.apollo-client-context'),
  Symbol.for('highforthis.web.i18n-context'),
  Symbol.for('highforthis.web.graphql-host-context'),
];

const clearContextRegistry = () => {
  const registry = globalThis as typeof globalThis & Record<symbol, unknown>;
  contextKeys.forEach((key) => delete registry[key]);
};

describe('server context', () => {
  beforeEach(() => {
    clearContextRegistry();
    vi.resetModules();
  });

  afterEach(clearContextRegistry);

  it('preserves context token identities across separate module graphs', async () => {
    const first = await import('../context.js');
    vi.resetModules();
    const second = await import('../context.js');

    expect(second.apolloClientContext).toBe(first.apolloClientContext);
    expect(second.i18nContext).toBe(first.i18nContext);
    expect(second.graphqlHostContext).toBe(first.graphqlHostContext);
  });
});
