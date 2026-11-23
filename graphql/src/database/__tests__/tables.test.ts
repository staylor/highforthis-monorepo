import { getTableBeforeWrite } from 'remix/data-table';
import { describe, expect, it } from 'vitest';

import { venues } from '../tables';

describe('writing a row', () => {
  const beforeWrite = getTableBeforeWrite(venues)!;

  it('leaves out the columns given as undefined, as Prisma did', () => {
    expect(
      beforeWrite({
        operation: 'update',
        tableName: 'Venue',
        value: { name: 'Brooklyn Steel', city: undefined },
      })
    ).toEqual({ value: { name: 'Brooklyn Steel' } });
  });

  it('writes null to clear a column', () => {
    expect(beforeWrite({ operation: 'update', tableName: 'Venue', value: { city: null } })).toEqual(
      { value: { city: null } }
    );
  });
});
