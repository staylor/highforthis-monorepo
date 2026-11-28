import { formatDate, formatSchedule } from '#/ui/shows/utils.ts';

export function dateTime(value: number | Parameters<typeof formatSchedule>[0]) {
  const d = typeof value === 'number' ? formatDate(value) : formatSchedule(value);
  return `${d.formatted}/${d.year}${d.time ? ' at ' + d.time.toLowerCase().replace(' ', '') : ''}`;
}
