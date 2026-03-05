import cn from 'classnames';
import { useTranslation } from 'react-i18next';

import Link from '#/components/Link';
import SectionHeader from '#/components/SectionHeader';
import type { ShowConnection } from '#/types/graphql';

import { formatArtists, formatShowLink } from '../Shows/utils';

function Sidebar({ shows }: { shows: ShowConnection }) {
  const { t } = useTranslation();
  if (!shows) {
    return null;
  }

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shows.edges.map(({ node }) => {
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
              <div className="flex-shrink-0 text-center">
                <div className="font-display text-pink text-2xl leading-none font-bold">
                  {String(date.getDate()).padStart(2, '0')}
                </div>
                <div className="text-muted dark:text-muted-dark text-xs font-medium tracking-wider uppercase tabular-nums">
                  {date.toLocaleString('en-us', { month: 'short' })}
                </div>
              </div>

              {/* Show info */}
              <div className="min-w-0 flex-1">
                <div className="font-display group-hover:text-pink text-base leading-snug font-semibold transition-colors">
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
    </section>
  );
}

export default Sidebar;
