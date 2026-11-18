import type { Show } from '../../types/graphql.ts';

export const cellBase = 'px-3 py-1.5 text-sm';
export const rowHover = 'transition-colors hover:bg-neutral-50 dark:hover:bg-surface-dark-card';
export const rowBorder = 'border-b border-neutral-100 last:border-b-0 dark:border-white/5';

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
    monthName: d.toLocaleString('en-us', { month: 'long' }),
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
