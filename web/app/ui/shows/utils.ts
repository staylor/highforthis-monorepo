import { routes } from '#/routes.ts';
import type { Show } from '#/types/graphql.ts';
import { colorTransition, text } from '#/ui/public/styles.ts';

export const cell = { padding: '0.375rem 0.75rem', ...text.sm };

export const row = {
  ...colorTransition,
  '&:hover': {
    backgroundColor: 'light-dark(var(--neutral-50), var(--surface-dark-card))',
  },
};

// toLocaleString() builds a new formatter on every call, which made formatting dates most of the
// shows pages' render time. Names are looked up like the date's other parts, in the server's zone.
const names = (options: Intl.DateTimeFormatOptions, count: number, date: (i: number) => number) => {
  const format = new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' });
  return Array.from({ length: count }, (_, i) => format.format(date(i)));
};

/** January to December, by `getMonth()` */
export const monthNames = names({ month: 'long' }, 12, (i) => Date.UTC(2000, i, 1));
/** Sun to Sat, by `getDay()`. January 2, 2000 was a Sunday. */
export const weekdayNames = names({ weekday: 'short' }, 7, (i) => Date.UTC(2000, 0, 2 + i));

export const formatDate = (date?: number) => {
  const d = date ? new Date(date) : new Date();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const year = d.getFullYear();
  const hours = d.getHours();
  const minutes = d.getMinutes();
  return {
    month,
    day,
    monthName: monthNames[d.getMonth()],
    year,
    time: `${hours % 12 || 12}:${String(minutes).padStart(2, '0')}${hours < 12 ? 'AM' : 'PM'}`,
    formatted: `${month < 10 ? `0${month}` : month}/${day < 10 ? `0${day}` : day}`,
  };
};

type ShowLike = Pick<Show, 'id' | 'title' | 'url'> & {
  artists: Array<Pick<Show['artists'][number], 'name' | 'slug'>>;
  venue?: Pick<Show['venue'], 'name'>;
};

/**
 * What to call a show: its title, or who's playing. A show can be left with neither when its
 * artists are deleted, and then it goes by where it is.
 */
export const formatArtists = (show: ShowLike) => {
  if (show.title) {
    return show.title;
  }
  return show.artists.map(({ name }) => name).join(' / ') || (show.venue?.name ?? '');
};

const smallWords = new Set(['a', 'and', 'at', 'of', 'the', '&']);

/** A name's initials, for an artist or place without artwork: Madison Square Garden is MSG */
export function initials(name: string) {
  const words = name.split(/\s+/).filter(Boolean);
  const kept = words.filter((word) => !smallWords.has(word.toLowerCase()));
  return (kept.length > 0 ? kept : words)
    .slice(0, 3)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

/** A show's page, or its artist's when the show is one artist and nothing more. */
export const formatShowLink = (show: ShowLike) => {
  const [artist, ...others] = show.artists;
  if (show.title || show.url || !artist || others.length > 0) {
    return routes.shows.show.href({ id: show.id });
  }
  return routes.artist.href({ slug: artist.slug });
};
