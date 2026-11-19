import type { Handle, RemixNode } from 'remix/component';

import { cn } from '../public/cn.ts';

import { buttonClass, heading1 } from './public/styles.ts';

export function Heading(handle: Handle<{ children?: RemixNode }>) {
  return () => (
    <h1 class={cn('mr-4 mb-4 inline-block align-middle dark:text-white', heading1)}>
      {handle.props.children}
    </h1>
  );
}

export function HeaderAdd(handle: Handle<{ href: string; label: string }>) {
  return () => (
    <a href={handle.props.href} class={buttonClass(false, 'mb-4 align-middle')}>
      {handle.props.label}
    </a>
  );
}

/** A notice that something went wrong, as the admin app's `Alert`. */
export function Alert(handle: Handle<{ children?: RemixNode }>) {
  return () => (
    <div
      role="alert"
      class="mb-5 max-w-2xl border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-900 dark:bg-red-950/30 dark:text-red-200"
    >
      {handle.props.children}
    </div>
  );
}
