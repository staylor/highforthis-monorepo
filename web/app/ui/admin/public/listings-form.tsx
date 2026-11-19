import { clientEntry, on, type Handle } from 'remix/component';

import { cn } from '../../public/cn.ts';

import { splitArtists } from './split-artists.ts';
import { buttonClass, inputBase } from './styles.ts';

// A row per upcoming show, with a box to pick it and the artists to add it with. The page
// translates and formats everything on the server, since the browser has no translations; the
// labels that depend on what's typed come as templates or as one per case.

/** A listed artist's pill, shown while the artists field holds their name. */
interface Pill {
  name: string;
  /** Whether adding the show creates the artist. */
  isNew: boolean;
  text: string;
  title: string;
}

export interface ListingRow {
  sourceId: string;
  day: string;
  time: string | null;
  /** The artists field's starting value: the headliners, separated by semicolons. */
  artists: string;
  /** Everyone listed, headliners first, for a show that can't be added. */
  listed: string;
  support: string[];
  pills: Pill[];
  /** Whether it can be added: it has a date, isn't cancelled and isn't in the data yet. */
  canAdd: boolean;
  tickets: { text: string; href: string | null };
  /** The show it's already in the data as. */
  showHref: string | null;
  dateChanged: boolean;
  selectLabel: string;
  artistsLabel: string;
}

interface ListingsFormProps {
  listings: ListingRow[];
  summary: string;
  labels: {
    hideAdded: string;
    /** The add button's label for each number of picked shows, from none up. */
    add: string[];
    empty: string;
    date: string;
    artists: string;
    tickets: string;
    inYourData: string;
    added: string;
    dateChanged: string;
    /** "+ {{names}}": adds the support acts that aren't in the artists field. */
    addSupport: string;
  };
}

const cell = 'px-2.5 py-2 align-top text-sm';
const pill = 'rounded-full border px-2 py-px text-xs';

export const ListingsForm = clientEntry(
  import.meta.url,
  function ListingsForm(handle: Handle<ListingsFormProps>) {
    const selected = new Set<string>();
    const artists = new Map<string, string>();
    let hideAdded = false;

    const row = (listing: ListingRow) => {
      const { labels } = handle.props;
      const value = artists.get(listing.sourceId) ?? listing.artists;
      const names = splitArtists(value);
      const missingSupport = listing.support.filter((name) => !names.includes(name));
      const checked = selected.has(listing.sourceId);
      return (
        <tr
          key={listing.sourceId}
          class={cn('border-b border-detail', !listing.canAdd && 'text-neutral-500')}
        >
          <td class={cell}>
            <input
              type="checkbox"
              name="selected"
              value={listing.sourceId}
              checked={checked}
              disabled={!listing.canAdd}
              aria-label={listing.selectLabel}
              class="rounded-sm border-gray-300 text-pink shadow-sm focus:ring-pink disabled:opacity-40"
              mix={on('change', (event) => {
                if (event.currentTarget.checked) {
                  selected.add(listing.sourceId);
                } else {
                  selected.delete(listing.sourceId);
                }
                handle.update();
              })}
            />
          </td>
          <td class={cn(cell, 'whitespace-nowrap')}>
            {listing.day}
            {listing.time && <span class="block text-xs">{listing.time}</span>}
          </td>
          <td class={cell}>
            {listing.canAdd ? (
              <>
                <input
                  type="text"
                  name={`artists-${listing.sourceId}`}
                  value={value}
                  required={checked}
                  aria-label={listing.artistsLabel}
                  class={cn(inputBase, 'w-full')}
                  mix={on('input', (event) => {
                    // Re-rendering keeps the value, which a client entry's input otherwise loses
                    artists.set(listing.sourceId, event.currentTarget.value);
                    handle.update();
                  })}
                />
                <div class="mt-1 flex flex-wrap items-center gap-1">
                  {listing.pills
                    .filter(({ name }) => names.includes(name))
                    .map(({ isNew, text, title }) => (
                      <span
                        title={title}
                        class={cn(
                          pill,
                          isNew
                            ? 'border-amber-600 text-amber-700'
                            : 'border-green-700 text-green-700'
                        )}
                      >
                        {text}
                      </span>
                    ))}
                  {missingSupport.length > 0 && (
                    <button
                      type="button"
                      class="cursor-pointer text-xs text-pink underline"
                      mix={on('click', () => {
                        artists.set(listing.sourceId, [...names, ...missingSupport].join('; '));
                        handle.update();
                      })}
                    >
                      {labels.addSupport.replace('{{names}}', missingSupport.join(', '))}
                    </button>
                  )}
                </div>
              </>
            ) : (
              listing.listed
            )}
          </td>
          <td class={cell}>
            {listing.tickets.href ? (
              <a
                href={listing.tickets.href}
                target="_blank"
                rel="noreferrer"
                class="text-pink underline"
              >
                {listing.tickets.text}
              </a>
            ) : (
              listing.tickets.text
            )}
          </td>
          <td class={cell}>
            {listing.showHref && (
              <>
                <a href={listing.showHref} class="text-green-700 underline">
                  {labels.added}
                </a>
                {listing.dateChanged && (
                  <span class="block text-xs text-amber-700">{labels.dateChanged}</span>
                )}
              </>
            )}
          </td>
        </tr>
      );
    };

    return () => {
      const { listings, summary, labels } = handle.props;
      const visible = hideAdded ? listings.filter((listing) => !listing.showHref) : listings;
      const count = selected.size;
      return (
        <form method="post">
          <div class="mb-3 flex flex-wrap items-center gap-4">
            <p class="text-sm text-neutral-600 dark:text-neutral-300">{summary}</p>
            <label class="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={hideAdded}
                class="rounded-sm border-gray-300 text-pink shadow-sm focus:ring-pink"
                mix={on('change', (event) => {
                  hideAdded = event.currentTarget.checked;
                  handle.update();
                })}
              />
              {labels.hideAdded}
            </label>
            <button
              type="submit"
              disabled={count === 0}
              class={buttonClass(true, 'disabled:cursor-not-allowed disabled:opacity-50')}
            >
              {labels.add[Math.min(count, labels.add.length - 1)]}
            </button>
          </div>
          {listings.length === 0 ? (
            <p class="my-10">{labels.empty}</p>
          ) : (
            <div class="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              <table class="w-full min-w-160 table-fixed border-spacing-0 border border-detail shadow-sm">
                <thead>
                  <tr class="border-b border-detail text-left text-sm">
                    <th class={cn(cell, 'w-10')} aria-hidden="true"></th>
                    <th class={cn(cell, 'w-32')}>{labels.date}</th>
                    <th class={cell}>{labels.artists}</th>
                    <th class={cn(cell, 'w-32')}>{labels.tickets}</th>
                    <th class={cn(cell, 'w-44')}>{labels.inYourData}</th>
                  </tr>
                </thead>
                <tbody>{visible.map(row)}</tbody>
              </table>
            </div>
          )}
        </form>
      );
    };
  }
);
