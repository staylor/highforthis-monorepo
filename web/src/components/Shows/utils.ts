import type { Show } from '@/types/graphql';

export const formatDate = (date?: number) => {
  const d = date ? new Date(date) : new Date();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const year = d.getFullYear();
  const hours = d.getHours();
  const minutes = d.getMinutes();
  return {
    month,
    monthName: d.toLocaleString('en-us', {
      month: 'long',
    }),
    year,
    time: `${hours % 12}:${String(minutes).padStart(2, '0')}${hours < 12 ? 'AM' : 'PM'}`,
    formatted: `${month < 10 ? `0${month}` : month}/${day < 10 ? `0${day}` : day}`,
  };
};

export const formatArtists = (show: Show) => {
  if (show.title) {
    return show.title;
  }

  return show.artists.map(({ name }) => name).join(' / ');
};

export const formatShowLink = (show: Show) => {
  let link;
  if (show.title || show.artists.length > 1) {
    link = `/show/${show.id}`;
  } else {
    link = `/artist/${show.artists[0].slug}`;
  }
  return link;
};
