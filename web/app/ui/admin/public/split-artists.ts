// The artists fields on the shows pages hold names separated by semicolons. The listings page
// uses this on the server and in the browser.
export const splitArtists = (value: string) =>
  value
    .split(';')
    .map((name) => name.trim())
    .filter(Boolean);
