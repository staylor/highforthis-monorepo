import type { Handle, RemixNode } from 'remix/component';

import { cn } from '../public/cn.ts';

import { buttonClass, heading1 } from './styles.ts';

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
