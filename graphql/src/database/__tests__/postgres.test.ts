import { EventEmitter } from 'node:events';

import pg from 'pg';
import { DataTableDatabaseError } from 'remix/data-table';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createDatabase, createPool } from '../postgres';

// Nothing here connects: a pool makes its first connection for its first query, and the
// transactions' connections are stand-ins
const DATABASE_URL = 'postgresql://test@localhost:5432/test';

describe('createPool', () => {
  it('tells its caller that an idle connection failed, instead of ending the process', async () => {
    const onIdleError = vi.fn();
    const pool = createPool(DATABASE_URL, onIdleError);
    const failure = new Error('terminating connection due to administrator command');

    // An error event that nothing listens for throws
    expect(() => pool.emit('error', failure)).not.toThrow();
    expect(onIdleError).toHaveBeenCalledExactlyOnceWith(failure);
    await pool.end();
  });

  it('survives the failure when no caller asked to hear of it', async () => {
    const pool = createPool(DATABASE_URL);

    expect(() => pool.emit('error', new Error('Connection terminated unexpectedly'))).not.toThrow();
    await pool.end();
  });

  // The pool only listens to a connection while it's idle
  it('listens to each connection, so one that a transaction holds can fail too', async () => {
    const pool = createPool(DATABASE_URL);
    const client = new EventEmitter();

    pool.emit('connect', client);

    expect(() =>
      client.emit('error', new Error('Connection terminated unexpectedly'))
    ).not.toThrow();
    await pool.end();
  });
});

describe('createDatabase', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  /** A connection whose statements work, apart from the one that `fails` matches */
  function connection(fails?: RegExp) {
    const query = vi.fn(async (statement: string) => {
      if (fails?.test(statement)) {
        throw new Error(`${statement} failed`);
      }
      return { rows: [] };
    });
    vi.spyOn(pg.Pool.prototype, 'connect').mockImplementation(async () => ({
      query,
      release: vi.fn(),
    }));
    return query;
  }

  it('ends its pool when it closes, and only once', async () => {
    const end = vi.spyOn(pg.Pool.prototype, 'end');
    const database = createDatabase(DATABASE_URL);

    await database.close();
    await database.close();

    expect(end).toHaveBeenCalledTimes(1);
  });

  it("passes on what a transaction's own code throws, once it has rolled back", async () => {
    const query = connection();
    const refusal = new Error('Listing 4 is gone');

    await expect(
      createDatabase(DATABASE_URL).transaction(async () => {
        throw refusal;
      })
    ).rejects.toBe(refusal);
    expect(query).toHaveBeenLastCalledWith('rollback');
  });

  // pg's own error would name the database's address
  it('answers a transaction that cannot begin with a database error', async () => {
    const refused = new Error('connect ECONNREFUSED 10.0.0.5:5432');
    vi.spyOn(pg.Pool.prototype, 'connect').mockImplementation(async () => {
      throw refused;
    });

    const failure = await createDatabase(DATABASE_URL)
      .transaction(async () => 'saved')
      .catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(DataTableDatabaseError);
    expect(failure).toMatchObject({ message: 'Database transaction failed', cause: refused });
  });

  it('answers a transaction that cannot commit with a database error', async () => {
    connection(/^commit$/);

    await expect(
      createDatabase(DATABASE_URL).transaction(async () => 'saved')
    ).rejects.toBeInstanceOf(DataTableDatabaseError);
  });

  it('answers one that can neither finish nor roll back with a database error', async () => {
    connection(/^rollback$/);

    const failure = await createDatabase(DATABASE_URL)
      .transaction(async () => {
        throw new Error('the connection was lost');
      })
      .catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(DataTableDatabaseError);
    expect(failure).toMatchObject({ cause: expect.any(AggregateError) });
  });
});
