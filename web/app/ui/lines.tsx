import type { RemixNode } from 'remix/component';

/** Text with its line breaks as `<br>`s. The text is escaped like any other. */
export function lines(text: string): RemixNode[] {
  return text.split('\n').flatMap((line, i) => (i === 0 ? [line] : [<br />, line]));
}
