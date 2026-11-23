import { getTableBeforeWrite } from 'remix/data-table';
import { describe, expect, it } from 'vitest';

import { newId, venues } from '../tables';

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

describe('newId', () => {
  it("makes IDs like Prisma's cuid(), which sort by when they were made", async () => {
    const first = newId();
    await new Promise((resolve) => setTimeout(resolve, 2));
    const second = newId();

    expect(first).toMatch(/^c[0-9a-z]{24}$/);
    expect([second, first].sort()).toEqual([first, second]);
    expect(newId()).not.toBe(newId());
  });
});
