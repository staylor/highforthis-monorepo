/** Whether a URL's year segment, as in /videos/2024, is a year. */
export const isYear = (value: string) => /^\d{4}$/.test(value);
