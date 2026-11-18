import type { Handle, RemixNode } from 'remix/component';

/**
 * A plain anchor that prefetches on intent. The Remix runtime intercepts same-origin
 * navigation and resets scroll itself.
 */
export function Link(handle: Handle<{ href: string; class?: string; children?: RemixNode }>) {
  return () => (
    <a href={handle.props.href} class={handle.props.class} data-rmx-prefetch="intent">
      {handle.props.children}
    </a>
  );
}
