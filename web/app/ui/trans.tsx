import type { RemixNode } from 'remix/component';

import type { TFunction } from '../lib/i18n.ts';

type Components = Record<string, (children: string) => RemixNode>;

const defaultComponents: Components = {
  strong: (children) => <strong>{children}</strong>,
};

/**
 * Minimal stand-in for react-i18next's <Trans>: translates `key` and turns
 * `<Tag>text</Tag>` in the result into elements from `components`.
 */
export function trans(
  t: TFunction,
  key: string,
  options: Record<string, unknown> = {},
  components: Components = {}
): RemixNode[] {
  const text = t(key, options) as string;
  const map = { ...defaultComponents, ...components };
  const nodes: RemixNode[] = [];
  const pattern = /<(\w+)>(.*?)<\/\1>/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    nodes.push(text.slice(last, match.index));
    const render = map[match[1]];
    nodes.push(render ? render(match[2]) : match[2]);
    last = match.index + match[0].length;
  }
  nodes.push(text.slice(last));
  return nodes;
}
