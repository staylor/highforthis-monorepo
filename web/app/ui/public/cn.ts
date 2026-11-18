type ClassValue = string | false | null | undefined | Record<string, boolean | undefined>;

/**
 * `classnames` is CommonJS, and the asset server serves browser modules unbundled through
 * an import map, so browser-reachable code can't import it. This covers the uses here.
 */
export function cn(...values: ClassValue[]): string {
  const classes: string[] = [];
  for (const value of values) {
    if (!value) {
      continue;
    }
    if (typeof value === 'string') {
      classes.push(value);
    } else {
      for (const [name, on] of Object.entries(value)) {
        if (on) {
          classes.push(name);
        }
      }
    }
  }
  return classes.join(' ');
}
