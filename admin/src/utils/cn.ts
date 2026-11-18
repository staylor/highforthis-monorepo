type ClassValue = string | false | null | undefined | Record<string, boolean | undefined>;

/**
 * Joins class names, skipping falsy values. Replaces `classnames`, which is CommonJS: a
 * Remix 3 admin couldn't serve it to browsers, since modules are served unbundled.
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
