// The artists fields on the shows pages hold names separated by semicolons
export const splitArtists = (value: string) =>
  value
    .split(';')
    .map((name) => name.trim())
    .filter(Boolean);
