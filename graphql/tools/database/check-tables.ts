// Checks that src/database/tables.ts describes the database's tables: their columns, each
// column's type and whether it can be null, and their primary keys. The migrations make the
// tables and tables.ts describes them by hand, so CI runs this on a database it has just migrated.
import {
  getTableColumnDefinitions,
  getTableName,
  getTablePrimaryKey,
  sql,
  tableMetadataKey,
  type AnyTable,
  type ColumnDefinition,
} from 'remix/data-table';

import { createDatabase } from '#/database/postgres';
import * as definitions from '#/database/tables';

// Tables that tables.ts leaves out: the migrations' journal, and DashboardSettings, which nothing
// has used since the Google Analytics settings were removed
const UNDESCRIBED = new Set(['data_table_migrations', 'DashboardSettings']);

// `text[]` columns, which tables.ts describes as text, as there's no array column type
const ARRAYS = new Set(['Passkey.transports']);

/** The Postgres type a described column stands for, as `udt_name` names it */
function databaseType({ type, precision, scale, withTimezone }: ColumnDefinition) {
  switch (type) {
    case 'integer':
      return 'int4';
    case 'bigint':
      return 'int8';
    case 'boolean':
      return 'bool';
    case 'binary':
      return 'bytea';
    case 'json':
      return 'jsonb';
    // tables.ts describes `double precision`, which has no column type, as decimal(53, 0)
    case 'decimal':
      return precision === 53 && scale === 0 ? 'float8' : 'numeric';
    case 'timestamp':
      return withTimezone ? 'timestamptz' : 'timestamp';
    case 'time':
      return withTimezone ? 'timetz' : 'time';
    default:
      return type;
  }
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Add it to graphql/.env or export it first.');
}

const db = createDatabase(connectionString);

try {
  const { rows: columnRows = [] } = await db.exec(sql`
    select c.table_name, c.column_name, c.udt_name, c.is_nullable = 'YES' as nullable
    from information_schema.columns c
    join information_schema.tables t using (table_schema, table_name)
    where c.table_schema = current_schema() and t.table_type = 'BASE TABLE'
    order by c.table_name, c.ordinal_position
  `);
  const { rows: keyRows = [] } = await db.exec(sql`
    select t.relname as table_name,
      string_agg(a.attname::text, ',' order by array_position(i.indkey::int2[], a.attnum)) as columns
    from pg_index i
    join pg_class t on t.oid = i.indrelid
    join pg_attribute a on a.attrelid = t.oid and a.attnum = any(i.indkey)
    where i.indisprimary and t.relnamespace = current_schema()::regnamespace
    group by t.relname
  `);

  type Column = { udtName: string; nullable: boolean };
  const database = new Map<string, Map<string, Column>>();
  for (const row of columnRows as {
    table_name: string;
    column_name: string;
    udt_name: string;
    nullable: boolean;
  }[]) {
    const columns = database.get(row.table_name) ?? new Map<string, Column>();
    columns.set(row.column_name, { udtName: row.udt_name, nullable: row.nullable });
    database.set(row.table_name, columns);
  }
  const primaryKeys = new Map(
    (keyRows as { table_name: string; columns: string }[]).map((row) => [
      row.table_name,
      row.columns,
    ])
  );

  // The tables among what tables.ts exports, which includes relations and helpers too
  const exported: unknown[] = Object.values(definitions);
  const described = exported.filter(
    (value): value is AnyTable =>
      typeof value === 'object' && value !== null && tableMetadataKey in value
  );
  const problems: string[] = [];

  for (const table of described) {
    const name = getTableName(table);
    const columns = database.get(name);
    if (!columns) {
      problems.push(`${name} is in tables.ts, but not in the database`);
      continue;
    }

    const columnDefinitions: Record<string, ColumnDefinition> = getTableColumnDefinitions(table);
    for (const [column, definition] of Object.entries(columnDefinitions)) {
      const actual = columns.get(column);
      if (!actual) {
        problems.push(`${name}.${column} is in tables.ts, but not in the database`);
        continue;
      }

      const type = databaseType(definition);
      const expected = ARRAYS.has(`${name}.${column}`) ? `_${type}` : type;
      if (actual.udtName !== expected) {
        problems.push(
          `${name}.${column} is ${actual.udtName} in the database, and ${definition.type} (${expected}) in tables.ts`
        );
      }
      if (actual.nullable !== Boolean(definition.nullable)) {
        problems.push(
          actual.nullable
            ? `${name}.${column} can be null in the database, but isn't nullable() in tables.ts`
            : `${name}.${column} is nullable() in tables.ts, but can't be null in the database`
        );
      }
    }
    for (const column of columns.keys()) {
      if (!(column in columnDefinitions)) {
        problems.push(`${name}.${column} is in the database, but not in tables.ts`);
      }
    }

    const primaryKey = getTablePrimaryKey(table).join(',');
    if (primaryKeys.get(name) !== primaryKey) {
      problems.push(
        `${name}'s primary key is (${primaryKeys.get(name) ?? 'none'}) in the database, and (${primaryKey}) in tables.ts`
      );
    }
  }

  const describedNames = new Set(described.map((table) => getTableName(table)));
  for (const name of database.keys()) {
    if (!describedNames.has(name) && !UNDESCRIBED.has(name)) {
      problems.push(`${name} is in the database, but not in tables.ts`);
    }
  }

  if (problems.length > 0) {
    console.error(`src/database/tables.ts doesn't match the database:\n- ${problems.join('\n- ')}`);
    process.exitCode = 1;
  } else {
    console.log(`src/database/tables.ts describes the database's ${described.length} tables.`);
  }
} finally {
  await db.close();
}
