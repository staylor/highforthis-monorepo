import { z } from 'zod';

// GraphQL, JavaScript dates and PostgreSQL columns exchange instants at millisecond precision.
export const epochMillis = z
  .number()
  .int()
  .min(Date.parse('0001-01-01T00:00:00Z'))
  .max(Date.parse('9999-12-31T23:59:59.999Z'));

export const isoInstant = z.iso
  .datetime({ offset: true })
  .refine(
    (iso) => !/\.\d{3}\d*[1-9]/.test(iso) && epochMillis.safeParse(Date.parse(iso)).success,
    'Expected an instant representable in whole milliseconds in years 0001–9999'
  );
