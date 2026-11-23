import { clientEntry, css, on, type Handle } from 'remix/component';

import { merge, text } from '#/ui/public/styles.ts';

import { splitArtists } from './split-artists.ts';
import {
  button,
  checkbox,
  disabledFades,
  pinkLink,
  table,
  tableScroller,
  wideInput,
} from './styles.ts';

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

const cell = { padding: '0.5rem 0.625rem', verticalAlign: 'top', ...text.sm };
const cellStyle = css(cell);

// Whether an artist is new to the data or already in it
const pill = css({
  borderRadius: '9999px',
  border: '1px solid var(--green-700)',
  padding: '1px 0.5rem',
  ...text.xs,
  color: 'var(--green-700)',
  '&[data-new]': { borderColor: 'var(--amber-600)', color: 'var(--amber-700)' },
});

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
          data-disabled={!listing.canAdd || undefined}
          mix={css({
            borderBottom: '1px solid var(--detail)',
            '&[data-disabled]': { color: 'var(--neutral-500)' },
          })}
        >
          <td mix={cellStyle}>
            <input
              type="checkbox"
              name="selected"
              value={listing.sourceId}
              checked={checked}
              disabled={!listing.canAdd}
              aria-label={listing.selectLabel}
              mix={[
                checkbox,
                on('change', (event) => {
                  if (event.currentTarget.checked) {
                    selected.add(listing.sourceId);
                  } else {
                    selected.delete(listing.sourceId);
                  }
                  handle.update();
                }),
              ]}
            />
          </td>
          <td mix={css({ ...cell, whiteSpace: 'nowrap' })}>
            {listing.day}
            {listing.time && (
              <span mix={css({ display: 'block', ...text.xs })}>{listing.time}</span>
            )}
          </td>
          <td mix={cellStyle}>
            {listing.canAdd ? (
              <>
                <input
                  type="text"
                  name={`artists-${listing.sourceId}`}
                  value={value}
                  required={checked}
                  aria-label={listing.artistsLabel}
                  mix={[
                    wideInput,
                    on('input', (event) => {
                      // Re-rendering keeps the value, which a client entry's input otherwise loses
                      artists.set(listing.sourceId, event.currentTarget.value);
                      handle.update();
                    }),
                  ]}
                />
                <div
                  mix={css({
                    marginTop: '0.25rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '0.25rem',
                  })}
                >
                  {listing.pills
                    .filter(({ name }) => names.includes(name))
                    .map(({ isNew, text, title }) => (
                      <span title={title} data-new={isNew || undefined} mix={pill}>
                        {text}
                      </span>
                    ))}
                  {missingSupport.length > 0 && (
                    <button
                      type="button"
                      mix={[
                        css({
                          cursor: 'pointer',
                          ...text.xs,
                          color: 'var(--pink)',
                          textDecoration: 'underline',
                        }),
                        on('click', () => {
                          artists.set(listing.sourceId, [...names, ...missingSupport].join('; '));
                          handle.update();
                        }),
                      ]}
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
          <td mix={cellStyle}>
            {listing.tickets.href ? (
              <a href={listing.tickets.href} target="_blank" rel="noreferrer" mix={pinkLink}>
                {listing.tickets.text}
              </a>
            ) : (
              listing.tickets.text
            )}
          </td>
          <td mix={cellStyle}>
            {listing.showHref && (
              <>
                <a
                  href={listing.showHref}
                  mix={css({ color: 'var(--green-700)', textDecoration: 'underline' })}
                >
                  {labels.added}
                </a>
                {listing.dateChanged && (
                  <span mix={css({ display: 'block', ...text.xs, color: 'var(--amber-700)' })}>
                    {labels.dateChanged}
                  </span>
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
          <div
            mix={css({
              marginBottom: '0.75rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '1rem',
            })}
          >
            <p mix={css({ ...text.sm, color: 'var(--neutral-600)' })}>{summary}</p>
            <label mix={css({ display: 'flex', alignItems: 'center', gap: '0.5rem', ...text.sm })}>
              <input
                type="checkbox"
                checked={hideAdded}
                mix={[
                  checkbox,
                  on('change', (event) => {
                    hideAdded = event.currentTarget.checked;
                    handle.update();
                  }),
                ]}
              />
              {labels.hideAdded}
            </label>
            <button
              type="submit"
              disabled={count === 0}
              mix={css(merge(button(true), disabledFades))}
            >
              {labels.add[Math.min(count, labels.add.length - 1)]}
            </button>
          </div>
          {listings.length === 0 ? (
            <p mix={css({ marginBlock: '2.5rem' })}>{labels.empty}</p>
          ) : (
            <div mix={tableScroller}>
              <table mix={table}>
                <thead>
                  <tr
                    mix={css({
                      borderBottom: '1px solid var(--detail)',
                      textAlign: 'left',
                      ...text.sm,
                    })}
                  >
                    <th mix={css({ ...cell, width: '2.5rem' })} aria-hidden="true"></th>
                    <th mix={css({ ...cell, width: '8rem' })}>{labels.date}</th>
                    <th mix={cellStyle}>{labels.artists}</th>
                    <th mix={css({ ...cell, width: '8rem' })}>{labels.tickets}</th>
                    <th mix={css({ ...cell, width: '11rem' })}>{labels.inYourData}</th>
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
