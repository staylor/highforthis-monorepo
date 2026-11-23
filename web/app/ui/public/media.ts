// Where an upload is stored. Browser code uses it too, such as the post editor's images.
export const uploadUrl = (destination: string, fileName: string) => {
  return `https://storage.googleapis.com/wonderboymusic/${destination}/${fileName}`;
};

/** The thumbnail to show for a video: the widest of the sizes that fit a grid. */
export const findThumbnail = <T extends { width: number }>(thumbnails: readonly T[]) =>
  [640, 480, 320].map((width) => thumbnails.find((t) => t.width === width)).find(Boolean);

/** Apple Music's artwork URL at a size: it has {w} and {h} placeholders. */
export const artworkUrl = (url: string, size: number) => url.replace(/\{[wh]\}/g, String(size));
