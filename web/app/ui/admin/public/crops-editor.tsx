import { clientEntry, css, on, type Handle } from 'remix/component';

import { merge, text } from '#/ui/public/styles.ts';

import { button, input, wideInput } from './styles.ts';

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

const sizeInput = css(
  merge(input, {
    display: 'inline-block',
    height: '2rem',
    width: '4rem',
    padding: '0.125rem 0.25rem',
  })
);

const cell = css({ paddingBlock: '0.25rem', paddingRight: '0.625rem' });
const headingCell = css({
  paddingBlock: '0.25rem',
  paddingRight: '0.625rem',
  textAlign: 'left',
  ...text.sm,
});

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
        mix={sizeInput}
      />
    );

    return () => {
      const { labels } = handle.props;
      return (
        <>
          <button
            type="button"
            mix={[
              css(merge(button(), { fontSize: '0.75rem' })),
              on('click', () => {
                currentRows().push(row({ name: '', width: null, height: null }));
                handle.update();
              }),
            ]}
          >
            {labels.add}
          </button>
          <table mix={css({ marginBlock: '1.25rem' })}>
            <thead>
              <tr>
                <th mix={headingCell}>{labels.name}</th>
                <th mix={headingCell} colSpan={2}>
                  {labels.dimensions}
                </th>
              </tr>
            </thead>
            <tbody>
              {currentRows().map(({ key, crop }, i) => (
                <tr key={key}>
                  <td mix={cell}>
                    <input
                      type="text"
                      name={`crops[${i}][name]`}
                      defaultValue={crop.name}
                      size={20}
                      aria-label={`${labels.name} ${i + 1}`}
                      mix={wideInput}
                    />
                  </td>
                  <td mix={[cell, css({ whiteSpace: 'nowrap' })]}>
                    {size(crop, 'width', i)}
                    {' x '}
                    {size(crop, 'height', i)}
                  </td>
                  <td mix={cell}>
                    <button
                      type="button"
                      mix={[
                        css({
                          cursor: 'pointer',
                          ...text.sm,
                          '&:hover': { textDecoration: 'underline' },
                        }),
                        on('click', () => {
                          rows = currentRows().filter((r) => r.key !== key);
                          handle.update();
                        }),
                      ]}
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
