import cn from 'classnames';
import { useTranslation } from 'react-i18next';

import Link from '#/components/Link';
import SectionHeader from '#/components/SectionHeader';
import type { ShowConnection } from '#/types/graphql';

import { formatArtists, formatShowLink } from '../Shows/utils';

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
        <p className="text-muted dark:text-muted-dark text-sm">{t('shows.noRecommended')}</p>
      )}
      <div className="flex flex-col gap-8">
        {groups.map((group) => (
          <div key={group.key}>
            <h3 className="text-muted dark:text-muted-dark mb-3 text-xs font-semibold tracking-wider uppercase">
              {group.label}
            </h3>
            <div className="columns-1 gap-3 sm:columns-2 lg:columns-3">
              {group.shows.map(({ node }) => {
                const date = new Date(node.date);
                return (
                  <Link
                    to={formatShowLink(node)}
                    key={node.id}
                    className={cn(
                      'group mb-3 flex break-inside-avoid items-start gap-4 rounded-xl p-4',
                      'border border-neutral-100 bg-white shadow-sm',
                      'dark:bg-surface-dark-card dark:border-white/5',
                      'transition-all duration-300 hover:-translate-y-0.5',
                      'hover:shadow-pink/5 dark:hover:shadow-pink/10 hover:shadow-lg'
                    )}
                  >
                    {/* Date block */}
                    <div className="flex-shrink-0 text-center">
                      <div className="text-pink text-2xl leading-none font-bold">
                        {String(date.getDate()).padStart(2, '0')}
                      </div>
                      <div className="text-muted dark:text-muted-dark text-xs font-medium tracking-wider uppercase tabular-nums">
                        {date.toLocaleString('en-us', { weekday: 'short' })}
                      </div>
                    </div>

                    {/* Show info */}
                    <div className="min-w-0 flex-1">
                      <div className="group-hover:text-pink text-base leading-snug font-semibold transition-colors">
                        {formatArtists(node)}
                      </div>
                      <div className="text-muted dark:text-muted-dark mt-1 text-sm">
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
