import { clientEntry, on, ref, type Handle } from 'remix/component';

import { checkbox } from './styles.ts';

// The list table's header box: checks or unchecks every row's box, and shows whether all, some
// or none of the rows are checked as rows are ticked by hand. The table has one above its rows
// and one below, and each follows the rows' changes. Without JavaScript, rows are ticked one by
// one.

/**
 * The table's row boxes, which belong to the bulk actions form. Each row's delete form has a
 * hidden `ids` input too, which isn't one.
 */
function rowBoxes(table: HTMLTableElement | null) {
  return [
    ...(table?.querySelectorAll<HTMLInputElement>('tbody input[type="checkbox"][name="ids"]') ??
      []),
  ];
}

export const SelectAll = clientEntry(
  import.meta.url,
  function SelectAll(handle: Handle<{ label: string }>) {
    let input: HTMLInputElement | undefined;

    function follow() {
      if (!input) {
        return;
      }
      const rows = rowBoxes(input.closest('table'));
      const checked = rows.filter((row) => row.checked).length;
      input.checked = rows.length > 0 && checked === rows.length;
      input.indeterminate = checked > 0 && checked < rows.length;
    }

    return () => {
      // A new page of rows (after a delete, say) comes in unchecked
      handle.queueTask(follow);
      return (
        <input
          type="checkbox"
          aria-label={handle.props.label}
          mix={[
            checkbox,
            ref((node, signal) => {
              input = node;
              // Row boxes and the other header box report their changes to the table
              node.closest('table')?.addEventListener('change', follow, { signal });
              follow();
            }),
            on('change', (event) => {
              const { checked } = event.currentTarget;
              for (const row of rowBoxes(event.currentTarget.closest('table'))) {
                row.checked = checked;
              }
              // This change then reaches the table, where both header boxes follow the rows
            }),
          ]}
        />
      );
    };
  }
);
