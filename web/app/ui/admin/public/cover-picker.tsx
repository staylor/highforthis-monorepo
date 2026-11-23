import { clientEntry, css, on, type Handle } from 'remix/component';

import { lg, merge, sm, text, xl } from '#/ui/public/styles.ts';

import { button, checkbox, disabledFades } from './styles.ts';

interface Album {
  id: string;
  name: string;
  artistName: string;
  /** The release year and the artwork's size, such as "2024 · 3000 × 3000". */
  details: string;
  cover: string;
}

interface CoverPickerProps {
  albums: Album[];
  labels: {
    /** The button's label for each number of picked covers, from none up. */
    add: string[];
    adding: string;
  };
}

// An album to pick, outlined in pink once it's picked
const albumStyle = css({
  display: 'grid',
  height: '100%',
  cursor: 'pointer',
  gridTemplateColumns: 'auto 1fr',
  alignContent: 'start',
  columnGap: '0.5rem',
  borderRadius: '0.25rem',
  border: '2px solid transparent',
  padding: '0.375rem',
  ...text.sm,
  '&:hover': { borderColor: 'var(--detail)' },
  '&[data-checked]': { borderColor: 'var(--pink)' },
});

export const CoverPicker = clientEntry(
  import.meta.url,
  function CoverPicker(handle: Handle<CoverPickerProps>) {
    const selected = new Set<string>();
    let submitting = false;

    return () => {
      const { albums, labels } = handle.props;
      const count = selected.size;
      return (
        <form
          method="post"
          mix={on('submit', () => {
            submitting = true;
            handle.update();
          })}
        >
          <button
            type="submit"
            disabled={count === 0 || submitting}
            mix={css(merge(button(true), { marginBottom: '1rem' }, disabledFades))}
          >
            {submitting ? labels.adding : labels.add[Math.min(count, labels.add.length - 1)]}
          </button>
          <ul
            mix={css({
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '1rem',
              [sm]: { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
              [lg]: { gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' },
              [xl]: { gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' },
            })}
          >
            {albums.map((album) => {
              const checked = selected.has(album.id);
              return (
                <li key={album.id}>
                  <label data-checked={checked || undefined} mix={albumStyle}>
                    <img
                      src={album.cover}
                      alt=""
                      loading="lazy"
                      mix={css({
                        gridColumn: 'span 2 / span 2',
                        marginBottom: '0.5rem',
                        aspectRatio: '1 / 1',
                        width: '100%',
                        backgroundColor: 'var(--neutral-100)',
                        objectFit: 'cover',
                      })}
                    />
                    <input
                      type="checkbox"
                      name="selected"
                      value={album.id}
                      checked={checked}
                      mix={[
                        checkbox,
                        css({ marginTop: '0.125rem' }),
                        on('change', (event) => {
                          if (event.currentTarget.checked) {
                            selected.add(album.id);
                          } else {
                            selected.delete(album.id);
                          }
                          handle.update();
                        }),
                      ]}
                    />
                    <span mix={css({ minWidth: 0 })}>
                      <strong mix={css({ display: 'block' })}>{album.name}</strong>
                      {album.artistName}
                      <small
                        mix={css({
                          display: 'block',
                          ...text.xs,
                          color: 'var(--neutral-500)',
                        })}
                      >
                        {album.details}
                      </small>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </form>
      );
    };
  }
);
