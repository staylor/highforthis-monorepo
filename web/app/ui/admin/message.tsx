import type { Handle } from 'remix/component';

import { cn } from '../public/cn.ts';

import { getAdmin } from './context.tsx';
import { Icon } from './icon.tsx';

interface MessageProps {
  text: string;
  /** The query parameter that shows the message, such as `deleted` for `?deleted=2`. */
  param?: string;
}

/**
 * A notice for the query parameter a save or delete redirected with, such as `?message=updated`.
 * Its close button links to the same page without the parameter, so it works without JavaScript.
 */
export function Message(handle: Handle<MessageProps>) {
  return () => {
    const { url } = getAdmin(handle);
    const param = handle.props.param ?? 'message';
    if (!url.searchParams.has(param)) {
      return null;
    }
    const dismissed = new URL(url);
    dismissed.searchParams.delete(param);

    return (
      <div
        class={cn(
          'border-pink border-l-4 bg-neutral-50 shadow-xs',
          'relative mt-1 mb-4 block py-px pr-9 pl-3'
        )}
      >
        <p class="my-2 p-0.5 text-sm text-dark">{handle.props.text}</p>
        <a
          href={`${dismissed.pathname}${dismissed.search}`}
          aria-label="Dismiss"
          class="absolute top-0 right-1 m-0 p-2 text-neutral-400 transition-colors hover:text-neutral-900"
        >
          <Icon name="close" class="size-4" />
        </a>
      </div>
    );
  };
}
