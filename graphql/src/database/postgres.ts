import pg from 'pg';
import { DataTableDatabaseError, type Database, type TransactionOptions } from 'remix/data-table';
import { PostgresDatabase } from 'remix/data-table/postgres';

const TIMESTAMP = pg.types.builtins.TIMESTAMP;

// The `timestamp without time zone` columns hold UTC, as Prisma wrote them, and pg reads and
// writes them in the server's time zone, so a date would move by its offset. Read them as UTC on
// these pools…
const types = {
  getTypeParser: ((oid, format) =>
    oid === TIMESTAMP && format !== 'binary'
      ? (value: string) => new Date(`${value.replace(' ', 'T')}Z`)
      : pg.types.getTypeParser(oid, format)) as typeof pg.types.getTypeParser,
};

// …and write dates as UTC. pg has no per-pool setting for this.
pg.defaults.parseInputDatesAsUTC = true;

// Whoever is using a connection learns that it failed from their own query
const ignore = () => undefined;

/**
 * A pool that outlives its connections. One can fail while no query is running on it, as when the
 * database restarts, and pg then emits an error, which ends the process unless something listens
 * for it. An idle connection's failure goes to `onIdleError`, and the pool connects again for the
 * next query. A connection that a transaction holds fails that transaction's next query instead.
 */
export function createPool(connectionString: string, onIdleError: (error: Error) => void = ignore) {
  const pool = new pg.Pool({ connectionString, types });
  pool.on('error', (error) => onIdleError(error));
  pool.on('connect', (client) => client.on('error', ignore));
  return pool;
}

/** A database on a pool made for it, which remix/data-table would otherwise leave to its maker */
class PooledDatabase extends PostgresDatabase {
  #pool: pg.Pool;
  #ended?: Promise<void>;

  constructor(pool: pg.Pool) {
    super(pool);
    this.#pool = pool;
  }

  /** Ends the pool too */
  override async close() {
    await super.close();
    this.#ended ??= this.#pool.end();
    await this.#ended;
  }

  /**
   * A query that fails throws one of data-table's errors, but a transaction that can't begin,
   * commit or roll back throws pg's own, such as a refused connection with its address. Those are
   * wrapped the same way here, so a failure of the database can be told from an error the
   * transaction's own code threw, which passes through as it is.
   */
  override async transaction<TResult>(
    callback: (database: Database<'postgres'>) => Promise<TResult>,
    options?: TransactionOptions
  ): Promise<TResult> {
    let thrown: { error: unknown } | undefined;
    try {
      return await super.transaction(async (tx) => {
        try {
          return await callback(tx);
        } catch (error) {
          thrown = { error };
          throw error;
        }
      }, options);
    } catch (error) {
      if (thrown?.error === error) {
        throw error;
      }
      throw new DataTableDatabaseError('Database transaction failed', { cause: error });
    }
  }
}

/**
 * A remix/data-table database for the connection string, which reads and writes dates in UTC, and
 * tells `onIdleError` when a connection that nothing was using has failed. The tools that
 * shouldn't need the server's settings make their own.
 */
export function createDatabase(connectionString: string, onIdleError?: (error: Error) => void) {
  return new PooledDatabase(createPool(connectionString, onIdleError));
}
