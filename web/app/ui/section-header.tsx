import type { Handle } from 'remix/component';

import { Link } from './link.tsx';
import { cn } from './public/cn.ts';

export function SectionHeader(
  handle: Handle<{ label: string; viewAllLink?: string; viewAllText?: string }>
) {
  return () => {
    const { label, viewAllLink, viewAllText = 'View All →' } = handle.props;
    return (
      <div class="mb-6 flex items-center justify-between md:mb-10">
        <h2 class="text-xl font-black uppercase md:text-2xl dark:text-white">{label}</h2>
        {viewAllLink && (
          <Link
            href={viewAllLink}
            class="text-sm font-medium tracking-wide text-muted uppercase transition-colors hover:text-pink dark:text-muted-dark"
          >
            {viewAllText}
          </Link>
        )}
      </div>
    );
  };
}

export function AccentLine(handle: Handle<{ class?: string }>) {
  return () => (
    <div
      class={cn('my-8 h-px flex-1 md:my-12', handle.props.class)}
      style={{ background: 'linear-gradient(90deg, transparent, #e50082, transparent)' }}
    />
  );
}
