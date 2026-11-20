// The list table's select-all boxes. They run in a browser (`pnpm test:browser`), since checkbox
// state and its change events are the browser's.
import * as assert from 'remix/assert';
import { render } from 'remix/component/test';
import { describe, it, type TestContext } from 'remix/test';

import { SelectAll } from './select-all.tsx';

function renderTable(t: TestContext) {
  const result = render(
    <table>
      <thead>
        <tr>
          <th>
            <SelectAll label="Select all" />
          </th>
        </tr>
      </thead>
      <tbody>
        {['a', 'b', 'c'].map((id) => (
          <tr>
            <th>
              <input type="checkbox" name="ids" value={id} />
            </th>
            <td>
              {/* Each row's own delete form posts its ID too */}
              <form method="post">
                <input type="hidden" name="ids" value={id} />
              </form>
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th>
            <SelectAll label="Select all" />
          </th>
        </tr>
      </tfoot>
    </table>
  );
  t.after(result.cleanup);
  const [top, bottom] = [...result.$$('thead input, tfoot input')] as HTMLInputElement[];
  const rows = [...result.$$('tbody input[type="checkbox"]')] as HTMLInputElement[];
  return { ...result, top, bottom, rows };
}

type Act = ReturnType<typeof render>['act'];

// A click, as a person makes it, which changes the box and fires its change event
const click = (act: Act, box: HTMLInputElement) => act(() => box.click());

describe('SelectAll', () => {
  it('checks and unchecks every row, and the other header box follows', async (t) => {
    const { act, top, bottom, rows } = renderTable(t);
    await click(act, top);
    assert.deepEqual(
      rows.map((row) => row.checked),
      [true, true, true]
    );
    assert.equal(bottom.checked, true);

    await click(act, bottom);
    assert.deepEqual(
      rows.map((row) => row.checked),
      [false, false, false]
    );
    assert.equal(top.checked, false);
  });

  it('shows some rows checked, then all, as rows are ticked by hand', async (t) => {
    const { act, top, bottom, rows } = renderTable(t);
    await click(act, rows[0]);
    assert.equal(top.checked, false);
    assert.equal(top.indeterminate, true);
    assert.equal(bottom.indeterminate, true);

    await click(act, rows[1]);
    await click(act, rows[2]);
    assert.equal(top.checked, true);
    assert.equal(top.indeterminate, false);

    await click(act, rows[1]);
    assert.equal(top.checked, false);
    assert.equal(top.indeterminate, true);
  });

  it('is never submitted with the rows', (t) => {
    const { top } = renderTable(t);
    assert.equal(top.name, '');
    assert.equal(top.form, null);
  });
});
