// The calendar date (YYYY-MM-DD) of an instant in a time zone
export function dayKey(instant: Date, timeZone: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(instant);
}

// The instant a venue-local wall time (YYYY-MM-DD, HH:MM) happens
export function zonedTime(date: string, time: string, timeZone: string) {
  return zonedInstant(new Date(`${date}T${time}:00Z`), timeZone);
}

// The instant a wall time happens in a time zone, given as the instant it happens in UTC
export function zonedInstant(wall: Date, timeZone: string) {
  const firstOffset = offsetMinutes(wall, timeZone);
  const candidate = new Date(wall.getTime() - firstOffset * 60_000);
  const actualOffset = offsetMinutes(candidate, timeZone);
  if (actualOffset === firstOffset) return candidate;
  const corrected = new Date(wall.getTime() - actualOffset * 60_000);
  // If neither offset gives the requested time, the clock skipped it. Use the
  // later instant so a time in the gap moves forward.
  return offsetMinutes(corrected, timeZone) === actualOffset || corrected > candidate
    ? corrected
    : candidate;
}

function offsetMinutes(instant: Date, timeZone: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    })
      .formatToParts(instant)
      .map(({ type, value }) => [type, Number(value)])
  );
  const local = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
  return (local - instant.getTime()) / 60_000;
}
