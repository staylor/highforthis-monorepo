import { css, type Handle } from 'remix/component';

import type { AppQuery } from '#/types/graphql.ts';

import { getApp } from './app-context.tsx';
import { Link } from './link.tsx';
import { card, colorTransition, lg, linkHover, merge, sm, text } from './public/styles.ts';
import { SectionHeader } from './section-header.tsx';
import { formatArtists, formatShowLink, monthNames, weekdayNames } from './shows/utils.ts';

type Shows = NonNullable<AppQuery['shows']>;
type Edges = Shows['edges'];

function groupShowsByMonth(edges: Edges) {
  const groups: { key: string; label: string; shows: Edges }[] = [];
  const seen = new Map<string, number>();

  for (const edge of edges) {
    const date = new Date(edge.node.date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const label = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

    if (seen.has(key)) {
      groups[seen.get(key)!].shows.push(edge);
    } else {
      seen.set(key, groups.length);
      groups.push({ key, label, shows: [edge] });
    }
  }

  return groups;
}

const monthHeading = css({
  marginBottom: '0.75rem',
  ...text.xs,
  fontWeight: 600,
  letterSpacing: '0.05em',
  color: 'var(--muted)',
  textTransform: 'uppercase',
});

// Each month's shows fill columns top to bottom, with the row counts set per month
const monthGrid = css({
  display: 'grid',
  gap: '0.75rem',
  [sm]: {
    gridAutoFlow: 'column',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gridTemplateRows: 'var(--rows-sm)',
  },
  [lg]: {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gridTemplateRows: 'var(--rows-lg)',
  },
});

const showCard = css(
  merge(card, {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    borderRadius: '0.75rem',
    padding: '1rem',
  })
);

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
          <p mix={css({ ...text.sm, color: 'var(--muted)' })}>{t('shows.noRecommended')}</p>
        )}
        <div mix={css({ display: 'flex', flexDirection: 'column', gap: '2rem' })}>
          {groups.map((group) => (
            <div key={group.key}>
              <h3 mix={monthHeading}>{group.label}</h3>
              <div
                mix={monthGrid}
                style={{
                  '--rows-sm': `repeat(${Math.ceil(group.shows.length / 2)}, auto)`,
                  '--rows-lg': `repeat(${Math.ceil(group.shows.length / 3)}, auto)`,
                }}
              >
                {group.shows.map(({ node }) => {
                  const date = new Date(node.date);
                  return (
                    <Link href={formatShowLink(node)} mix={showCard}>
                      <div mix={css({ flexShrink: 0, textAlign: 'center' })}>
                        <div
                          mix={css({
                            fontSize: '1.5rem',
                            lineHeight: 1,
                            fontWeight: 700,
                            color: 'var(--pink)',
                          })}
                        >
                          {String(date.getDate()).padStart(2, '0')}
                        </div>
                        <div
                          mix={css({
                            ...text.xs,
                            fontWeight: 500,
                            letterSpacing: '0.05em',
                            color: 'var(--muted)',
                            textTransform: 'uppercase',
                            fontVariantNumeric: 'tabular-nums',
                          })}
                        >
                          {weekdayNames[date.getDay()]}
                        </div>
                      </div>
                      <div mix={css({ minWidth: 0, flex: '1 1 0%' })}>
                        <div
                          mix={css({
                            fontSize: '1rem',
                            lineHeight: 1.375,
                            fontWeight: 600,
                            ...colorTransition,
                            [linkHover]: { color: 'var(--pink)' },
                          })}
                        >
                          {formatArtists(node)}
                        </div>
                        <div
                          mix={css({
                            marginTop: '0.25rem',
                            ...text.sm,
                            color: 'var(--muted)',
                          })}
                        >
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
