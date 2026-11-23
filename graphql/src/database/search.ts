// Patterns for ILIKE, which match whatever the text's case. Search treats `%` and `_` as the
// characters themselves, where Prisma's `contains` let them through as wildcards.
const escape = (text: string) => text.replace(/[\\%_]/g, '\\$&');

/** Matches text that contains this */
export const containing = (text: string) => `%${escape(text)}%`;

/** Matches this text */
export const matching = (text: string) => escape(text);
