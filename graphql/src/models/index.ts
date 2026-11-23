import type { TableRow } from 'remix/data-table';

import type { userRoles, users } from '#/database/tables';

export type UserWithRoles = TableRow<typeof users> & { roles: TableRow<typeof userRoles>[] };

export interface AppContext {
  authUser?: UserWithRoles;
}
