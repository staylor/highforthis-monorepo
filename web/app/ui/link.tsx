import type { Handle, MixInput, RemixNode } from 'remix/component';

/**
 * A plain anchor that prefetches on intent. The Remix runtime intercepts same-origin
 * navigation and resets scroll itself.
 */
export function Link(
  handle: Handle<{
    href: string;
    mix?: MixInput<HTMLAnchorElement>;
    children?: RemixNode;
  }>
) {
  return () => (
    <a href={handle.props.href} mix={handle.props.mix} data-rmx-prefetch="intent">
      {handle.props.children}
    </a>
  );
}
