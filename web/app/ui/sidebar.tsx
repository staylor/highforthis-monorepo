import type { Handle } from 'remix/component';

import type { AppQuery } from '../types/graphql.ts';

import { getApp } from './app-context.tsx';
import { Link } from './link.tsx';
import { cn } from './public/cn.ts';
import { SectionHeader } from './section-header.tsx';
import { formatArtists, formatShowLink } from './shows/utils.ts';

type Shows = NonNullable<AppQuery['shows']>;
type Edges = Shows['edges'];

function groupShowsByMonth(edges: Edges) {
  const groups: { key: string; label: string; shows: Edges }[] = [];
  const seen = new Map<string, number>();

  for (const edge of edges) {
    const date = new Date(edge.node.date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const label = date.toLocaleString('en-us', { month: 'long', year: 'numeric' });

    if (seen.has(key)) {
      groups[seen.get(key)!].shows.push(edge);
    } else {
      seen.set(key, groups.length);
      groups.push({ key, label, shows: [edge] });
    }
  }

  return groups;
}

export function Sidebar(handle: Handle<{ shows: Shows }>) {
  const { t } = getApp(handle);

  return () => {
    const { shows } = handle.props;
    const groups = groupShowsByMonth(shows.edges);

    return (
      <section>
        <SectionHeader
          label={t('shows.upcoming')}
          viewAllLink="/shows"
          viewAllText="Full Calendar →"
        />
        {shows.edges.length === 0 && (
          <p class="text-sm text-muted dark:text-muted-dark">{t('shows.noRecommended')}</p>
        )}
        <div class="flex flex-col gap-8">
          {groups.map((group) => (
            <div key={group.key}>
              <h3 class="mb-3 text-xs font-semibold tracking-wider text-muted uppercase dark:text-muted-dark">
                {group.label}
              </h3>
              <div
                class={cn(
                  'grid gap-3',
                  'sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-(--rows-sm)',
                  'lg:grid-cols-3 lg:grid-rows-(--rows-lg)'
                )}
                style={{
                  '--rows-sm': `repeat(${Math.ceil(group.shows.length / 2)}, auto)`,
                  '--rows-lg': `repeat(${Math.ceil(group.shows.length / 3)}, auto)`,
                }}
              >
                {group.shows.map(({ node }) => {
                  const date = new Date(node.date);
                  return (
                    <Link
                      href={formatShowLink(node)}
                      class={cn(
                        'group flex items-start gap-4 rounded-xl p-4',
                        'border border-neutral-100 bg-white shadow-sm',
                        'dark:bg-surface-dark-card dark:border-white/5',
                        'transition-all duration-300 hover:-translate-y-0.5',
                        'hover:shadow-pink/5 dark:hover:shadow-pink/10 hover:shadow-lg'
                      )}
                    >
                      <div class="shrink-0 text-center">
                        <div class="text-2xl leading-none font-bold text-pink">
                          {String(date.getDate()).padStart(2, '0')}
                        </div>
                        <div class="text-xs font-medium tracking-wider text-muted uppercase tabular-nums dark:text-muted-dark">
                          {date.toLocaleString('en-us', { weekday: 'short' })}
                        </div>
                      </div>
                      <div class="min-w-0 flex-1">
                        <div class="text-base leading-snug font-semibold transition-colors group-hover:text-pink">
                          {formatArtists(node)}
                        </div>
                        <div class="mt-1 text-sm text-muted dark:text-muted-dark">
                          {node.venue.name}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };
}
