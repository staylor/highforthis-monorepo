import {
  clockAt,
  clockInstant,
  instantMilliseconds,
  plainDate,
  plainTime,
  SITE_TIME_ZONE,
  zoneId,
} from '@highforthis/shared/time';

export interface Schedule {
  localDate: string;
  localTime?: string | null;
  timeZone?: string | null;
  startsAt?: number | null;
}

function namedZone(value?: string | null) {
  if (!value) return null;
  // A name: not an offset such as -05:00, nor a date and time that carries a zone
  if (!/^[a-z][\w+/-]*$/i.test(value)) throw new RangeError('Expected an IANA time zone');
  // Resolve named zones with the same IANA rules used for the clock conversion, and keep the name
  // given: Intl answers the one its own list prefers, such as Europe/Kiev for Europe/Kyiv.
  return zoneId(value);
}

/** A provider's field can be malformed, and a clock can fall in a gap or repeated hour. */
function unknownOnRangeError<T>(parse: () => T) {
  try {
    return parse();
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;
    return null;
  }
}

function startFor(
  localDate: string | null,
  localTime: string | null,
  zone: string | null,
  exact?: number | null
) {
  const wall = localDate && localTime && `${localDate}T${localTime}`;
  if (typeof exact === 'number') {
    if (!wall || !Number.isSafeInteger(exact))
      throw new RangeError('An exact start needs a local date and time');
    if (zone && !clockAt(exact, zone).equals(wall))
      throw new RangeError('The exact start disagrees with the venue clock');
    return new Date(exact);
  }
  return wall && zone
    ? unknownOnRangeError(() => new Date(clockInstant(wall, zone, 'reject')))
    : null;
}

/** Validate admin input. An explicit instant can identify either occurrence of a repeated hour. */
export function resolveSchedule(input: Schedule) {
  const localDate = plainDate(input.localDate).toString();
  const localTime = input.localTime ? plainTime(input.localTime) : null;
  const timeZone = namedZone(input.timeZone);
  return {
    localDate,
    localTime,
    timeZone,
    startsAt: startFor(localDate, localTime, timeZone, input.startsAt),
  };
}

/** Preserve the reliable fields of each feed record, even when the source contradicts itself. */
export function feedSchedule(
  date?: string | null,
  time?: string | null,
  zone?: string | null,
  iso?: string | null
) {
  const localDate = date ? unknownOnRangeError(() => plainDate(date).toString()) : null;
  const localTime = localDate && time ? unknownOnRangeError(() => plainTime(time)) : null;
  const timeZone = unknownOnRangeError(() => namedZone(zone));
  const startsAt = unknownOnRangeError(() =>
    startFor(localDate, localTime, timeZone, iso ? instantMilliseconds(iso) : null)
  );
  return { localDate, localTime, timeZone, startsAt };
}

/** The date older clients read on New York's clocks. */
export function legacyShowDate(localDate: string, localTime?: string | null) {
  return new Date(clockInstant(`${localDate}T${localTime ?? '20:00'}`, SITE_TIME_ZONE));
}
