import type { Show } from '#/types/graphql';

export const formatShowLink = (show: Show) => {
  let link;
  if (show.title || show.url || show.artists.length > 1) {
    link = `/shows/${show.id}`;
  } else {
    link = `/artist/${show.artists[0].slug}`;
  }
  return link;
};
