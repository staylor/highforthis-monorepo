const pad = (n: number) => String(n).padStart(2, '0');

/** A date and time as the admin's lists show them, in the server's time zone: 05/10/2024 at 8:00pm. */
export function dateTime(timestamp: number) {
  const d = new Date(timestamp);
  const hours = d.getHours();
  const time = `${hours % 12 || 12}:${pad(d.getMinutes())}${hours < 12 ? 'am' : 'pm'}`;
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()} at ${time}`;
}
