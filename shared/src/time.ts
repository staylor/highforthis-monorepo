import { Temporal } from '@js-temporal/polyfill';

/** The editorial calendar and the zone used by older clients to read Show.date. */
export const SITE_TIME_ZONE = 'America/New_York';

export function calendarDate(timestamp: number, zone = SITE_TIME_ZONE) {
  return Temporal.Instant.fromEpochMilliseconds(timestamp).toZonedDateTimeISO(zone).toPlainDate();
}

export function clockAt(timestamp: number, zone = SITE_TIME_ZONE) {
  return Temporal.Instant.fromEpochMilliseconds(timestamp)
    .toZonedDateTimeISO(zone)
    .toPlainDateTime();
}

/** Resolve a civil time under a named zone's rules. Compatible picks the first fold and advances gaps. */
export function clockInstant(
  local: string,
  zone: string,
  disambiguation: 'compatible' | 'reject' = 'compatible'
) {
  return Temporal.PlainDateTime.from(local).toZonedDateTime(zone, { disambiguation })
    .epochMilliseconds;
}

/**
 * A named zone's identifier, spelled as the IANA database spells it and otherwise as given:
 * `europe/kyiv` is `Europe/Kyiv`, not the `Europe/Kiev` that `Intl` answers for it. A name the
 * database doesn't have is a RangeError.
 */
export function zoneId(zone: string) {
  return Temporal.Instant.fromEpochMilliseconds(0).toZonedDateTimeISO(zone).timeZoneId;
}

export function instantMilliseconds(iso: string) {
  return Temporal.Instant.from(iso).epochMilliseconds;
}

/** Parse Gregorian calendar input without accepting normalization, offsets or trailing text. */
export function plainDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000'))
    throw new RangeError('Invalid calendar date');
  return Temporal.PlainDate.from(value);
}

export function plainTime(value: string) {
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?$/.test(value))
    throw new RangeError('Invalid clock time');
  const time = Temporal.PlainTime.from(value);
  return time.toString({
    smallestUnit: time.millisecond ? 'millisecond' : time.second ? 'second' : 'minute',
  });
}
