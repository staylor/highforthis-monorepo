import { and, ilike, ne } from 'remix/data-table';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { userRoles, users } from '#/database/tables';

import resolvers from '../User';

const { db, tx } = vi.hoisted(() => ({
  db: { count: vi.fn(), find: vi.fn(), transaction: vi.fn() },
  // A user and their roles are saved together or not at all
  tx: { create: vi.fn(), createMany: vi.fn(), deleteMany: vi.fn(), update: vi.fn() },
}));

vi.mock('#/database/db', () => ({ default: db }));

const user = { id: 'user-1', email: 'scott@example.test', name: 'Scott' };

/** Resets the mocks: no user has the email yet, and the user is saved in a transaction */
function resetMocks() {
  vi.resetAllMocks();
  db.transaction.mockImplementation(async (save) => save(tx));
  db.count.mockResolvedValue(0);
  db.find.mockResolvedValue(user);
  tx.update.mockResolvedValue(user);
}

describe("a user's roles", () => {
  beforeEach(resetMocks);

  const role = (name: string) => ({ id: expect.any(String), userId: 'user-1', name });

  // The roles were deleted, then saved again outside a transaction, and a role named twice broke
  // the save, which left the user with none, and an admin out of the admin
  it('are replaced in the same transaction as the user, each once', async () => {
    await resolvers.Mutation.updateUser(
      {},
      { id: 'user-1', input: { roles: ['admin', 'editor', 'admin'] } }
    );

    expect(tx.deleteMany).toHaveBeenCalledExactlyOnceWith(userRoles, {
      where: { userId: 'user-1' },
    });
    expect(tx.createMany).toHaveBeenCalledExactlyOnceWith(userRoles, [
      role('admin'),
      role('editor'),
    ]);
    expect(tx.update).toHaveBeenCalledWith(users, 'user-1', {}, expect.anything());
  });

  it('are kept when an update leaves them out', async () => {
    await resolvers.Mutation.updateUser({}, { id: 'user-1', input: { name: 'Scott T.' } });

    expect(tx.deleteMany).not.toHaveBeenCalled();
    expect(tx.createMany).not.toHaveBeenCalled();
  });

  it("are each given once to a new user, with the user's ID", async () => {
    await resolvers.Mutation.createUser(
      {},
      { input: { email: 'new@example.test', password: 'secret', roles: ['admin', 'admin'] } }
    );

    const [[, created]] = tx.create.mock.calls;
    expect(tx.createMany).toHaveBeenCalledExactlyOnceWith(userRoles, [
      { id: expect.any(String), userId: created.id, name: 'admin' },
    ]);
  });
});

// Signing in matches an email whatever its case, so two users' emails mustn't differ only in case
describe("users' emails", () => {
  beforeEach(resetMocks);

  it("turns away a new user with another user's email in another case", async () => {
    db.count.mockResolvedValue(1);

    await expect(
      resolvers.Mutation.createUser(
        {},
        { input: { email: ' Scott@Example.test ', password: 'secret' } }
      )
    ).rejects.toMatchObject({ message: 'Email already exists.' });
    expect(db.count).toHaveBeenCalledWith(users, {
      where: ilike('email', 'Scott@Example.test'),
    });
    expect(tx.create).not.toHaveBeenCalled();
  });

  it("checks other users' emails, so a user can change the case of their own", async () => {
    await resolvers.Mutation.updateUser(
      {},
      { id: 'user-1', input: { email: 'Scott@example.test' } }
    );

    expect(db.count).toHaveBeenCalledWith(users, {
      where: and(ilike('email', 'Scott@example.test'), ne('id', 'user-1')),
    });
    expect(tx.update).toHaveBeenCalledWith(
      users,
      'user-1',
      { email: 'Scott@example.test' },
      expect.anything()
    );
  });

  it("turns away a change to another user's email", async () => {
    db.count.mockResolvedValue(1);

    await expect(
      resolvers.Mutation.updateUser({}, { id: 'user-1', input: { email: 'other@example.test' } })
    ).rejects.toMatchObject({ message: 'Email already exists.' });
    expect(tx.update).not.toHaveBeenCalled();
  });
});
