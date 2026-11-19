import { clientEntry, on, type Handle } from 'remix/component';

import { cn } from '../../public/cn.ts';

import { buttonClass } from './styles.ts';

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
            class={buttonClass(true, 'mb-4 disabled:cursor-not-allowed disabled:opacity-50')}
          >
            {submitting ? labels.adding : labels.add[Math.min(count, labels.add.length - 1)]}
          </button>
          <ul class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {albums.map((album) => {
              const checked = selected.has(album.id);
              return (
                <li key={album.id}>
                  <label
                    class={cn(
                      'grid h-full cursor-pointer grid-cols-[auto_1fr] content-start gap-x-2 rounded-sm border-2 p-1.5 text-sm',
                      checked ? 'border-pink' : 'border-transparent hover:border-detail'
                    )}
                  >
                    <img
                      src={album.cover}
                      alt=""
                      loading="lazy"
                      class="col-span-2 mb-2 aspect-square w-full bg-neutral-100 object-cover dark:bg-neutral-800"
                    />
                    <input
                      type="checkbox"
                      name="selected"
                      value={album.id}
                      checked={checked}
                      class="mt-0.5 rounded-sm border-gray-300 text-pink shadow-sm focus:ring-pink"
                      mix={on('change', (event) => {
                        if (event.currentTarget.checked) {
                          selected.add(album.id);
                        } else {
                          selected.delete(album.id);
                        }
                        handle.update();
                      })}
                    />
                    <span class="min-w-0">
                      <strong class="block">{album.name}</strong>
                      {album.artistName}
                      <small class="block text-xs text-neutral-500 dark:text-neutral-400">
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
