import { describe, expect, it, vi } from 'vitest';

import { requireAdmin, type Resolver } from '#/authorization';
import type { AppContext, UserWithRoles } from '#/models';
import resolvers from '#/resolvers';

function user(...roles: string[]) {
  return {
    id: 'user-1',
    roles: roles.map((name) => ({ id: `role-${name}`, name, userId: 'user-1' })),
  } as UserWithRoles;
}

function call(resolver: unknown, context: AppContext) {
  return (resolver as Resolver)({}, {}, context, {});
}

describe('requireAdmin', () => {
  it('runs the resolver for an admin', () => {
    const guarded = requireAdmin(() => 'ok');

    expect(call(guarded, { authUser: user('admin') })).toBe('ok');
  });

  it('rejects an anonymous request without running the resolver', () => {
    const resolver = vi.fn();

    expect(() => call(requireAdmin(resolver), {})).toThrow(
      expect.objectContaining({ extensions: { code: 'UNAUTHENTICATED' } })
    );
    expect(resolver).not.toHaveBeenCalled();
  });

  it('rejects a signed-in user without the admin role', () => {
    const resolver = vi.fn();

    expect(() => call(requireAdmin(resolver), { authUser: user('editor') })).toThrow(
      expect.objectContaining({ extensions: { code: 'FORBIDDEN' } })
    );
    expect(resolver).not.toHaveBeenCalled();
  });
});

describe('resolvers', () => {
  it('reject every mutation and admin-only query from an anonymous request', () => {
    const guarded: [string, unknown][] = [
      ...Object.entries(resolvers.Mutation).map(([name, resolver]): [string, unknown] => [
        `Mutation.${name}`,
        resolver,
      ]),
      ['Query.user', resolvers.Query.user],
      ['Query.users', resolvers.Query.users],
    ];

    for (const [name, resolver] of guarded) {
      expect(() => call(resolver, {}), name).toThrow('Admin access required');
    }
  });
});
