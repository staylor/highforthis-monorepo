import type { Show } from '../../types/graphql.ts';
import { colorTransition, text } from '../public/styles.ts';

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
};

export const formatArtists = (show: ShowLike) => {
  if (show.title) {
    return show.title;
  }
  return show.artists.map(({ name }) => name).join(' / ');
};

export const formatShowLink = (show: ShowLike) => {
  if (show.title || show.url || show.artists.length > 1) {
    return `/shows/${show.id}`;
  }
  return `/artist/${show.artists[0].slug}`;
};
