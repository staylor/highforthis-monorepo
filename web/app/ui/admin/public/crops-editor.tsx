import { clientEntry, on, type Handle } from 'remix/component';

import { cn } from '../../public/cn.ts';

import { buttonClass, inputBase } from './styles.ts';

// A row per crop size, named crops[0][name], crops[0][width] and crops[0][height], with
// buttons to add and remove rows. Without JavaScript the rows the server rendered can still be
// edited and saved.

interface Crop {
  name: string;
  width: number | null;
  height: number | null;
}

interface CropsEditorProps {
  crops: Crop[];
  labels: {
    add: string;
    remove: string;
    name: string;
    dimensions: string;
    width: string;
    height: string;
  };
}

const sizeInput = cn(inputBase, 'inline-block h-8 w-16 px-1 py-0.5');

/** A row of the table: its crop as the page loaded it, and a key that stays with the row. */
interface Row {
  key: number;
  crop: Crop;
}

export const CropsEditor = clientEntry(
  import.meta.url,
  function CropsEditor(handle: Handle<CropsEditorProps>) {
    // The inputs are uncontrolled (defaultValue), so what's typed stays in the DOM. Each row
    // keeps its key, so removing one leaves the others' inputs as they are; only their names
    // are renumbered, which keeps the submitted rows an array.
    let nextKey = 0;
    const row = (crop: Crop): Row => ({ key: nextKey++, crop });
    let rows: Row[] | null = null;
    const currentRows = () => {
      rows ??= handle.props.crops.map(row);
      if (rows.length === 0) {
        rows.push(row({ name: '', width: null, height: null }));
      }
      return rows;
    };

    const size = (crop: Crop, prop: 'width' | 'height', i: number) => (
      <input
        type="number"
        name={`crops[${i}][${prop}]`}
        defaultValue={crop[prop] === null ? '' : String(crop[prop])}
        aria-label={`${handle.props.labels[prop]} ${i + 1}`}
        class={sizeInput}
      />
    );

    return () => {
      const { labels } = handle.props;
      return (
        <>
          <button
            type="button"
            class={buttonClass(false, 'h-6 px-2 pb-0.5 text-xs')}
            mix={on('click', () => {
              currentRows().push(row({ name: '', width: null, height: null }));
              handle.update();
            })}
          >
            {labels.add}
          </button>
          <table class="my-5">
            <thead>
              <tr>
                <th class="py-1 pr-2.5 text-left text-sm">{labels.name}</th>
                <th class="py-1 pr-2.5 text-left text-sm" colSpan={2}>
                  {labels.dimensions}
                </th>
              </tr>
            </thead>
            <tbody>
              {currentRows().map(({ key, crop }, i) => (
                <tr key={key}>
                  <td class="py-1 pr-2.5">
                    <input
                      type="text"
                      name={`crops[${i}][name]`}
                      defaultValue={crop.name}
                      size={20}
                      aria-label={`${labels.name} ${i + 1}`}
                      class={cn(inputBase, 'w-full')}
                    />
                  </td>
                  <td class="py-1 pr-2.5 whitespace-nowrap">
                    {size(crop, 'width', i)}
                    {' x '}
                    {size(crop, 'height', i)}
                  </td>
                  <td class="py-1 pr-2.5">
                    <button
                      type="button"
                      class="cursor-pointer text-sm hover:underline"
                      mix={on('click', () => {
                        rows = currentRows().filter((r) => r.key !== key);
                        handle.update();
                      })}
                    >
                      {labels.remove}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      );
    };
  }
);
