import Link from '@highforthis/shared/web/components/Link';
import { formatArtists, formatShowLink } from '@highforthis/shared/web/components/Shows/utils';
import type { ShowConnection } from '@highforthis/shared/web/types/graphql';
import cn from 'classnames';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import SectionHeader from '#/components/SectionHeader';

function groupShowsByMonth(shows: ShowConnection) {
  const groups: { key: string; label: string; shows: ShowConnection['edges'] }[] = [];
  const seen = new Map<string, number>();

  for (const edge of shows.edges) {
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

function Sidebar({ shows }: { shows: ShowConnection }) {
  const { t } = useTranslation();
  if (!shows) {
    return null;
  }

  const groups = groupShowsByMonth(shows);

  return (
    <section>
      <SectionHeader
        label={t('shows.upcoming')}
        viewAllLink="/shows"
        viewAllText="Full Calendar →"
      />
      {shows.edges.length === 0 && (
        <p className="text-sm text-muted dark:text-muted-dark">{t('shows.noRecommended')}</p>
      )}
      <div className="flex flex-col gap-8">
        {groups.map((group) => (
          <div key={group.key}>
            <h3 className="mb-3 text-xs font-semibold tracking-wider text-muted uppercase dark:text-muted-dark">
              {group.label}
            </h3>
            {/*
              A grid that fills column by column, not CSS columns: Safari can't
              split the layer a hover transition creates across columns, so the
              top card of the 2nd and 3rd columns vanished while animating.
            */}
            <div
              className={cn(
                'grid gap-3',
                'sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-(--rows-sm)',
                'lg:grid-cols-3 lg:grid-rows-(--rows-lg)'
              )}
              style={
                {
                  '--rows-sm': `repeat(${Math.ceil(group.shows.length / 2)}, auto)`,
                  '--rows-lg': `repeat(${Math.ceil(group.shows.length / 3)}, auto)`,
                } as CSSProperties
              }
            >
              {group.shows.map(({ node }) => {
                const date = new Date(node.date);
                return (
                  <Link
                    to={formatShowLink(node)}
                    key={node.id}
                    className={cn(
                      'group flex items-start gap-4 rounded-xl p-4',
                      'border border-neutral-100 bg-white shadow-sm',
                      'dark:bg-surface-dark-card dark:border-white/5',
                      'transition-all duration-300 hover:-translate-y-0.5',
                      'hover:shadow-pink/5 dark:hover:shadow-pink/10 hover:shadow-lg'
                    )}
                  >
                    {/* Date block */}
                    <div className="shrink-0 text-center">
                      <div className="text-2xl leading-none font-bold text-pink">
                        {String(date.getDate()).padStart(2, '0')}
                      </div>
                      <div className="text-xs font-medium tracking-wider text-muted uppercase tabular-nums dark:text-muted-dark">
                        {date.toLocaleString('en-us', { weekday: 'short' })}
                      </div>
                    </div>

                    {/* Show info */}
                    <div className="min-w-0 flex-1">
                      <div className="text-base leading-snug font-semibold transition-colors group-hover:text-pink">
                        {formatArtists(node)}
                      </div>
                      <div className="mt-1 text-sm text-muted dark:text-muted-dark">
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
}

export default Sidebar;
