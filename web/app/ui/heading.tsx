import type { Handle, RemixNode } from 'remix/component';

import { cn } from './public/cn.ts';

const headingBase = 'block mb-2 lg:mb-3 dark:text-white';
const heading1 = 'font-black uppercase text-2xl lg:text-3xl';
const heading2 = 'font-bold text-2xl';
const heading3 =
  'font-bold border-pink inline-block border-b-2 border-dashed mt-6 py-1 pl-0.5 pr-6 text-2xl';
const heading4 = 'font-bold text-lg';

type HeadingProps = { class?: string; children?: RemixNode };

export function Heading1(handle: Handle<HeadingProps>) {
  return () => (
    <h1 class={cn(headingBase, heading1, handle.props.class)}>{handle.props.children}</h1>
  );
}

export function Heading2(handle: Handle<HeadingProps>) {
  return () => (
    <h2 class={cn(headingBase, heading2, handle.props.class)}>{handle.props.children}</h2>
  );
}

export function Heading3(handle: Handle<HeadingProps>) {
  return () => (
    <h3 class={cn(headingBase, heading3, handle.props.class)}>{handle.props.children}</h3>
  );
}

export function Heading4(handle: Handle<HeadingProps>) {
  return () => (
    <h4 class={cn(headingBase, heading4, handle.props.class)}>{handle.props.children}</h4>
  );
}

export function PostTitle(handle: Handle<HeadingProps>) {
  return () => (
    <Heading1 class={cn('border-pink border-l-8 py-2 pl-2.5', handle.props.class)}>
      {handle.props.children}
    </Heading1>
  );
}

export function TextTitle(handle: Handle<HeadingProps>) {
  return () => (
    <h2 class={cn('mb-2 block text-3xl font-semibold lg:mb-3 dark:text-white', handle.props.class)}>
      {handle.props.children}
    </h2>
  );
}
