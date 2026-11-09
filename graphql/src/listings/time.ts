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
  const wall = new Date(`${date}T${time}:00Z`);
  return new Date(wall.getTime() - offsetMinutes(wall, timeZone) * 60_000);
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
