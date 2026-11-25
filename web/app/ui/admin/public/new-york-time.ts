// Shows are dated where they are, New York, whatever time zone the admin entering one is in: 8:00
// PM typed in Los Angeles for a show at Brooklyn Steel is 8:00 PM in Brooklyn, not 11:00 PM.
const TIME_ZONE = 'America/New_York';

const clocks = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

type ClockPart = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second';

/** What New York's clocks show at an instant */
function clockAt(timestamp: number): Record<ClockPart, string> {
  return Object.fromEntries(
    clocks.formatToParts(timestamp).map(({ type, value }) => [type, value])
  ) as Record<ClockPart, string>;
}

/** How far New York's clocks are ahead of UTC at an instant, in milliseconds: behind is negative */
function offsetAt(timestamp: number): number {
  const { year, month, day, hour, minute, second } = clockAt(timestamp);
  const clock = Date.UTC(+year, +month - 1, +day, +hour, +minute, +second);
  return clock - Math.floor(timestamp / 1000) * 1000;
}

/** A timestamp as New York's clocks show it, 2024-05-10T20:00, as a datetime-local input takes it */
export function toNewYorkTime(timestamp: number): string {
  const { year, month, day, hour, minute } = clockAt(timestamp);
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

/**
 * The instant New York's clocks show a datetime-local input's value, such as 2024-05-10T20:00, or
 * NaN for a value that isn't one.
 */
export function fromNewYorkTime(value: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/.exec(value);
  if (!match) {
    return Number.NaN;
  }
  const [year, month, day, hour, minute, second = 0] = match
    .slice(1)
    .map((part) => Number(part ?? 0));
  // The time read as UTC, less New York's offset then, checked again at the instant that gives in
  // case the clocks change in between
  const clock = Date.UTC(year, month - 1, day, hour, minute, second);
  return clock - offsetAt(clock - offsetAt(clock));
}
