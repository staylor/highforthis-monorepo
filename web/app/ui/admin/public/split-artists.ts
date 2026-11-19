// The artists fields on the shows pages hold names separated by semicolons. Moved from the admin
// app's src/utils/splitArtists.ts; the listings page uses it on the server and in the browser.
export const splitArtists = (value: string) =>
  value
    .split(';')
    .map((name) => name.trim())
    .filter(Boolean);
