import { gql } from 'graphql-tag';
import { css, type Handle } from 'remix/component';

import type { TFunction } from '#/lib/i18n.ts';
import { routes } from '#/routes.ts';
import type { ShowStatsQuery } from '#/types/graphql.ts';
import { getApp } from '#/ui/app-context.tsx';
import { PageHeader } from '#/ui/page-header.tsx';
import { artworkUrl } from '#/ui/public/media.ts';
import { colorTransition, displayType, md, srOnly, text } from '#/ui/public/styles.ts';
import { ShowsNav } from '#/ui/shows/nav.tsx';
import { initials } from '#/ui/shows/utils.ts';

export type StatsEntity = 'artist' | 'venue';

/** How many of the most seen the page asks for with their artwork and dates */
export const LEADERS = 20;

// The leaders with what their places show, then everyone's counts for the ranks and the lineup,
// so only the leaders' artwork is fetched
export const showStatsQuery = gql`
  query ShowStats($entity: ShowEntityType!, $leaders: Int!) {
    leaders: showStats(entity: $entity, first: $leaders) {
      count
      firstLocalDate
      lastLocalDate
      entity {
        ... on Artist {
          id
          name
          slug
          appleMusic {
            id
            artwork {
              bgColor
              textColor1
              textColor2
              url
            }
          }
        }
        ... on Venue {
          id
          city
          name
          slug
          state
        }
      }
    }
    showStats(entity: $entity) {
      count
      entity {
        ... on Artist {
          id
          name
          slug
        }
        ... on Venue {
          id
          name
          slug
        }
      }
    }
    showTotals {
      artists
      firstLocalDate
      shows
      venues
    }
  }
`;

type Stat = ShowStatsQuery['showStats'][number];
type Leader = ShowStatsQuery['leaders'][number] & { rank: number };

/** Ranks as a leaderboard does: a tie shares its rank, and the rank after it counts past them */
export function rankings(counts: number[]) {
  let rank = 0;
  return counts.map((count, index) => {
    if (index === 0 || count !== counts[index - 1]) {
      rank = index + 1;
    }
    return rank;
  });
}

/**
 * How many of the most seen get a place on the podium or the leaderboard: up to `max`, stopping
 * before a count that goes past it, so the lineup starts with every artist or venue of its count.
 * The podium keeps its three even so.
 */
export function leaderCount(counts: number[], max = LEADERS) {
  if (counts.length <= max) {
    return counts.length;
  }
  let end = max;
  while (end > 0 && counts[end - 1] === counts[max]) {
    end -= 1;
  }
  return Math.max(end, 3);
}

/** The rest, by how many shows each had, most first */
export function tiers(stats: Stat[]) {
  const groups: { count: number; stats: Stat[] }[] = [];
  for (const stat of stats) {
    const last = groups.at(-1);
    if (last?.count === stat.count) {
      last.stats.push(stat);
    } else {
      groups.push({ count: stat.count, stats: [stat] });
    }
  }
  return groups;
}

/** One of Apple Music's artwork colors, which it gives as hex without the # */
const hex = (color?: string | null) =>
  color && /^[0-9a-f]{6}$/i.test(color) ? `#${color}` : undefined;

/** The years from the first show to the latest: 2009–2025, or just 2019 */
function years(first: string, last: string) {
  const from = first.slice(0, 4);
  const to = last.slice(0, 4);
  return from === to ? from : `${from}–${to}`;
}

const entityHref = (entity: Stat['entity'], type: StatsEntity) =>
  routes[type].href({ slug: entity.slug });

/** Where a venue is, or nothing for an artist */
const place = (entity: Leader['entity']) =>
  'city' in entity ? [entity.city, entity.state].filter(Boolean).join(', ') : '';

const artworkOf = (entity: Leader['entity']) =>
  'appleMusic' in entity ? entity.appleMusic?.artwork : undefined;

// Each animation waits for someone who hasn't asked for reduced motion
const motion = (animation: string) => ({
  '@media (prefers-reduced-motion: no-preference)': { animation },
});

// --- The header

const tabs = css({
  display: 'inline-flex',
  gap: '0.25rem',
  borderRadius: '9999px',
  border: '1px solid var(--card-border)',
  backgroundColor: 'light-dark(var(--neutral-100), var(--surface-dark-card))',
  padding: '0.25rem',
});

const tab = css({
  borderRadius: '9999px',
  padding: '0.5rem 1.25rem',
  ...text.sm,
  fontWeight: 700,
  color: 'var(--muted)',
  ...colorTransition,
  '&:hover': { color: 'light-dark(var(--neutral-900), #fff)' },
  '&[aria-current="page"]': {
    backgroundColor: 'var(--pink)',
    color: '#fff',
    boxShadow: '0 6px 16px -6px rgb(229 0 130 / 0.7)',
  },
});

function Header(handle: Handle<{ entity: StatsEntity }>) {
  const { t } = getApp(handle);

  return () => {
    const { entity } = handle.props;
    return (
      <PageHeader
        display
        eyebrow={t('entity.stats.eyebrow')}
        title={t('entity.stats.heading')}
        nav={<ShowsNav />}
      >
        <nav aria-label={t('entity.stats.tabs.label')} mix={tabs}>
          {(['artist', 'venue'] as const).map((type) => (
            <a
              href={routes.shows.stats.href({ entity: type })}
              aria-current={type === entity ? 'page' : undefined}
              data-rmx-prefetch="intent"
              mix={tab}
            >
              {t(`entity.stats.tabs.${type}`)}
            </a>
          ))}
        </nav>
      </PageHeader>
    );
  };
}

// --- The totals

const totalsGrid = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '0.75rem',
  [md]: { gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' },
});

const totalTile = css({
  display: 'flex',
  flexDirection: 'column-reverse',
  gap: '0.25rem',
  borderRadius: '1rem',
  border: '1px solid var(--card-border)',
  background:
    'radial-gradient(circle at 100% 0%, rgb(229 0 130 / 0.14), transparent 65%), var(--card)',
  boxShadow: 'var(--shadow-sm)',
  padding: '1rem 1.25rem',
  '@keyframes hft-stats-rise': {
    from: { opacity: 0, transform: 'translateY(0.75rem)' },
  },
  ...motion('hft-stats-rise 600ms var(--ease-out) both'),
});

const totalValue = css({
  fontSize: '2.25rem',
  lineHeight: 1,
  fontWeight: 800,
  letterSpacing: '-0.03em',
  [md]: { fontSize: '3rem' },
});

const totalLabel = css({
  ...text.xs,
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--muted)',
});

function Totals(handle: Handle<{ totals: ShowStatsQuery['showTotals'] }>) {
  const { t } = getApp(handle);

  return () => {
    const { shows, artists, venues, firstLocalDate } = handle.props.totals;
    const tiles = [
      { label: t('entity.stats.totals.shows'), value: shows.toLocaleString('en-US') },
      { label: t('entity.stats.totals.artists'), value: artists.toLocaleString('en-US') },
      { label: t('entity.stats.totals.venues'), value: venues.toLocaleString('en-US') },
    ];
    if (firstLocalDate) {
      tiles.push({
        label: t('entity.stats.totals.since'),
        value: firstLocalDate.slice(0, 4),
      });
    }
    return (
      <dl mix={totalsGrid}>
        {tiles.map(({ label, value }, index) => (
          <div mix={totalTile} style={{ animationDelay: `${index * 70}ms` }}>
            <dt mix={totalLabel}>{label}</dt>
            <dd mix={totalValue}>{value}</dd>
          </div>
        ))}
      </dl>
    );
  };
}

// --- The podium

const podium = css({
  display: 'grid',
  gap: '1rem',
  marginBlock: '3rem',
  [md]: { gridTemplateColumns: '1fr 1.2fr 1fr', alignItems: 'end', gap: '1.25rem' },
});

// A place takes the colors of its artwork, as Apple Music's own pages do, through the custom
// properties its style sets
const podiumCard = css({
  position: 'relative',
  isolation: 'isolate',
  overflow: 'hidden',
  display: 'grid',
  gridTemplateColumns: 'auto minmax(0, 1fr)',
  alignItems: 'center',
  gap: '1.25rem',
  borderRadius: '1.5rem',
  border: '1px solid var(--card-border)',
  background: 'var(--bg, var(--card))',
  color: 'var(--fg, inherit)',
  boxShadow: 'var(--shadow-lg)',
  padding: '1.25rem',
  transition: 'translate 300ms var(--ease), box-shadow 300ms var(--ease)',
  '&:hover': { translate: '0 -0.25rem', boxShadow: 'var(--shadow-2xl)' },
  [md]: { gridTemplateColumns: 'minmax(0, 1fr)', alignItems: 'start', padding: '1.5rem' },
  '@keyframes hft-stats-podium': {
    from: { opacity: 0, transform: 'translateY(2rem) scale(0.96)' },
  },
  ...motion('hft-stats-podium 700ms var(--ease-out) both'),
});

// Second on the left, the winner raised in the middle with a pink ring, and third on the right
const places = [
  css({
    boxShadow: '0 0 0 2px var(--pink), 0 25px 50px -12px rgb(229 0 130 / 0.5)',
    [md]: { order: 2, paddingBlock: '2rem' },
    '&:hover': { boxShadow: '0 0 0 2px var(--pink), 0 30px 60px -12px rgb(229 0 130 / 0.6)' },
  }),
  css({ [md]: { order: 1 } }),
  css({ [md]: { order: 3 } }),
];

// The place's rank, huge, behind the rest
const rankNumeral = css({
  position: 'absolute',
  zIndex: -1,
  top: '-1rem',
  right: '0.5rem',
  ...displayType,
  fontSize: '7rem',
  color: 'var(--fg, var(--pink))',
  opacity: 0.18,
  [md]: { fontSize: '10rem' },
});

const podiumArt = css({
  width: '5.5rem',
  aspectRatio: '1',
  borderRadius: '1rem',
  objectFit: 'cover',
  boxShadow: '0 20px 40px -16px rgb(0 0 0 / 0.6)',
  [md]: { width: '8rem' },
});

const winnerArt = css({ [md]: { width: '11rem' } });

// For a place without artwork: its initials, in the site's title type
const monogram = css({
  display: 'grid',
  placeItems: 'center',
  width: '5.5rem',
  aspectRatio: '1',
  borderRadius: '1rem',
  backgroundColor: 'light-dark(rgb(229 0 130 / 0.08), rgb(229 0 130 / 0.16))',
  fontFamily: 'var(--font-title)',
  fontSize: '1.75rem',
  color: 'var(--fg, var(--pink))',
  [md]: { width: '8rem', fontSize: '2.5rem' },
});

const winnerMonogram = css({
  backgroundColor: 'rgb(255 255 255 / 0.16)',
  [md]: { width: '11rem', fontSize: '3.25rem' },
});

// In the place's colors, which the site's pink link colors would clash with
const podiumName = css({
  display: 'block',
  ...text.xl,
  fontWeight: 800,
  lineHeight: 1.15,
  color: 'inherit',
  '&:hover': { color: 'inherit', textDecoration: 'underline' },
  [md]: text['2xl'],
});

const secondary = css({ ...text.sm, color: 'var(--fg2, var(--muted))' });

const podiumCount = css({
  display: 'flex',
  alignItems: 'baseline',
  gap: '0.375rem',
  marginTop: '0.5rem',
});

const podiumNumber = css({
  fontSize: '2.5rem',
  lineHeight: 1,
  fontWeight: 900,
  letterSpacing: '-0.04em',
  [md]: { fontSize: '3rem' },
});

const unit = css({
  ...text.xs,
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--fg2, var(--muted))',
});

// The venue that won has no artwork to take colors from, so it takes the site's
const pinkPlace = {
  '--bg': 'linear-gradient(135deg, #e50082, #8c0050)',
  '--fg': '#fff',
  '--fg2': 'rgb(255 255 255 / 0.8)',
};

function PodiumPlace(handle: Handle<{ leader: Leader; place: number; entity: StatsEntity }>) {
  const { t } = getApp(handle);

  return () => {
    const { leader, place: index, entity: type } = handle.props;
    const { entity, count, rank } = leader;
    const artwork = artworkOf(entity);
    const colors = artwork?.url
      ? {
          '--bg': hex(artwork.bgColor),
          '--fg': hex(artwork.textColor1),
          '--fg2': hex(artwork.textColor2),
        }
      : index === 0
        ? pinkPlace
        : {};
    const where = place(entity);
    const winner = index === 0;
    return (
      // Third rises first, and the winner last
      <li
        mix={[podiumCard, places[index]]}
        style={{ ...colors, animationDelay: `${(2 - index) * 160 + 200}ms` }}
      >
        <span mix={rankNumeral} aria-hidden="true">
          {rank}
        </span>
        {artwork?.url ? (
          <img
            mix={[podiumArt, winner && winnerArt]}
            src={artworkUrl(artwork.url, winner ? 440 : 320)}
            alt=""
            width={winner ? 440 : 320}
            height={winner ? 440 : 320}
          />
        ) : (
          <span mix={[monogram, winner && winnerMonogram]} aria-hidden="true">
            {initials(entity.name)}
          </span>
        )}
        <div>
          <span mix={srOnly}>{t('entity.stats.rank', { rank })} </span>
          <a href={entityHref(entity, type)} data-rmx-prefetch="intent" mix={podiumName}>
            {entity.name}
          </a>
          {where && <p mix={secondary}>{where}</p>}
          <p mix={podiumCount}>
            <span mix={podiumNumber}>{count}</span>
            <span mix={unit}>{t('entity.stats.showsUnit', { count })}</span>
          </p>
          <p mix={[secondary, css({ fontWeight: 600, letterSpacing: '0.04em' })]}>
            {years(leader.firstLocalDate, leader.lastLocalDate)}
          </p>
        </div>
      </li>
    );
  };
}

// --- The leaderboard

const sectionHeading = css({
  marginBottom: '1rem',
  ...text['2xl'],
  fontWeight: 900,
  letterSpacing: '-0.01em',
  textTransform: 'uppercase',
});

// A row is a name, a bar and a count. The bar goes under the name where the row is narrow.
const boardRow = css({
  display: 'grid',
  gridTemplateColumns: '1.75rem 2.5rem minmax(0, 1fr) auto',
  gridTemplateAreas: '"rank art name count" "rank art bar bar"',
  alignItems: 'center',
  columnGap: '0.75rem',
  rowGap: '0.375rem',
  borderRadius: '0.75rem',
  padding: '0.5rem 0.75rem',
  ...colorTransition,
  '&:hover': { backgroundColor: 'var(--lift)' },
  [md]: {
    gridTemplateColumns: '2.5rem 2.5rem minmax(0, 18rem) minmax(0, 1fr) 3rem',
    gridTemplateAreas: '"rank art name bar count"',
    columnGap: '1rem',
  },
});

const boardRank = css({
  gridArea: 'rank',
  ...text.lg,
  fontWeight: 800,
  fontVariantNumeric: 'tabular-nums',
  textAlign: 'right',
  color: 'var(--muted)',
});

const boardArt = css({
  gridArea: 'art',
  width: '2.5rem',
  height: '2.5rem',
  borderRadius: '9999px',
  objectFit: 'cover',
  boxShadow: 'var(--shadow-sm)',
});

const boardMonogram = css({
  gridArea: 'art',
  display: 'grid',
  placeItems: 'center',
  width: '2.5rem',
  height: '2.5rem',
  borderRadius: '9999px',
  backgroundColor: 'light-dark(rgb(229 0 130 / 0.08), rgb(229 0 130 / 0.16))',
  ...text.xs,
  fontWeight: 800,
  color: 'var(--pink)',
});

const boardName = css({ gridArea: 'name', minWidth: 0 });

const boardLink = css({
  display: 'block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontWeight: 700,
  ...colorTransition,
  '&:hover': { color: 'var(--pink)' },
});

const boardDetail = css({ display: 'block', ...text.xs, color: 'var(--muted)' });

const boardBar = css({ gridArea: 'bar', height: '0.75rem' });

// Square where it starts, rounded where the count ends it
const boardFill = css({
  height: '100%',
  borderRadius: '0 4px 4px 0',
  backgroundColor: 'var(--pink)',
  '@keyframes hft-stats-bar': {
    from: { clipPath: 'inset(0 100% 0 0)' },
    to: { clipPath: 'inset(0 0 0 0)' },
  },
  ...motion('hft-stats-bar 900ms var(--ease-out) both'),
});

const boardCount = css({
  gridArea: 'count',
  ...text.lg,
  fontWeight: 800,
  fontVariantNumeric: 'tabular-nums',
  textAlign: 'right',
});

function Leaderboard(handle: Handle<{ leaders: Leader[]; most: number; entity: StatsEntity }>) {
  const { t } = getApp(handle);

  return () => {
    const { leaders, most, entity: type } = handle.props;
    return (
      <section mix={css({ marginBlock: '3rem' })}>
        <h2 mix={sectionHeading}>{t(`entity.stats.leaders.${type}`)}</h2>
        <ol mix={css({ display: 'grid', gap: '0.125rem' })}>
          {leaders.map((leader, index) => {
            const { entity, count, rank } = leader;
            const artwork = artworkOf(entity);
            const where = place(entity);
            return (
              <li mix={boardRow}>
                <span mix={boardRank}>
                  <span mix={srOnly}>{t('entity.stats.rank', { rank })}</span>
                  <span aria-hidden="true">{rank}</span>
                </span>
                {artwork?.url ? (
                  <img
                    mix={boardArt}
                    src={artworkUrl(artwork.url, 80)}
                    alt=""
                    width={80}
                    height={80}
                    loading="lazy"
                  />
                ) : (
                  <span mix={boardMonogram} aria-hidden="true">
                    {initials(entity.name)}
                  </span>
                )}
                <span mix={boardName}>
                  <a href={entityHref(entity, type)} data-rmx-prefetch="intent" mix={boardLink}>
                    {entity.name}
                  </a>
                  <span mix={boardDetail}>
                    {where ? `${where} · ` : ''}
                    {years(leader.firstLocalDate, leader.lastLocalDate)}
                  </span>
                </span>
                <span mix={boardBar} aria-hidden="true">
                  <span
                    mix={[boardFill, css({ display: 'block' })]}
                    style={{
                      width: `${(count / most) * 100}%`,
                      animationDelay: `${300 + index * 45}ms`,
                    }}
                  />
                </span>
                <span mix={boardCount}>
                  {count}
                  <span mix={srOnly}> {t('entity.stats.showsUnit', { count })}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </section>
    );
  };
}

// --- The lineup: everyone else, billed like a festival poster

const lineup = css({
  marginTop: '3.5rem',
  borderRadius: '1.5rem',
  border: '1px solid var(--card-border)',
  background:
    'radial-gradient(ellipse at top, rgb(229 0 130 / 0.14), transparent 60%), var(--card)',
  padding: '2.5rem 1.25rem',
  textAlign: 'center',
  [md]: { padding: '3rem 3.5rem' },
});

const lineupHeading = css({
  ...displayType,
  fontSize: '1.75rem',
  lineHeight: 1.1,
  [md]: { fontSize: '2.75rem' },
});

// The tier's name between two rules
const tierName = css({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  marginBlock: '2.25rem 0.75rem',
  ...text.xs,
  fontWeight: 800,
  letterSpacing: '0.3em',
  textTransform: 'uppercase',
  color: 'var(--pink)',
  '&::before, &::after': {
    content: '""',
    flex: 1,
    height: 1,
    backgroundColor: 'var(--card-border)',
  },
});

const tierList = css({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  rowGap: '0.375rem',
  fontWeight: 800,
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
});

// The more shows a tier had, the bigger its names, as a poster bills its headliners
const tierSizes = [
  css(text.sm),
  css(text.base),
  css({ ...text.base, [md]: text.lg }),
  css({ ...text.lg, [md]: text.xl }),
];

const billed = css({
  ...colorTransition,
  '&:hover': { color: 'var(--pink)' },
});

const star = css({ marginInline: '0.625rem', color: 'var(--pink)' });

const tierTitle = (t: TFunction, count: number) => {
  if (count === 1) return t('entity.stats.once');
  if (count === 2) return t('entity.stats.twice');
  return t('entity.stats.times', { count });
};

function Lineup(handle: Handle<{ tiers: ReturnType<typeof tiers>; entity: StatsEntity }>) {
  const { t } = getApp(handle);

  return () => {
    const { tiers: groups, entity: type } = handle.props;
    return (
      <section mix={lineup}>
        <h2 mix={lineupHeading}>{t(`entity.stats.rest.${type}`)}</h2>
        {groups.map(({ count, stats }) => (
          <>
            <h3 mix={tierName}>{tierTitle(t, count)}</h3>
            <ul mix={[tierList, tierSizes[Math.min(count, tierSizes.length) - 1]]}>
              {stats.map(({ entity }, index) => (
                <li>
                  {index > 0 && (
                    <span mix={star} aria-hidden="true">
                      {'★'}
                    </span>
                  )}
                  <a href={entityHref(entity, type)} mix={billed}>
                    {entity.name}
                  </a>
                </li>
              ))}
            </ul>
          </>
        ))}
      </section>
    );
  };
}

/**
 * The artists or venues we've seen the most: the totals, the top three on a podium, the rest of
 * the leaders as bars, and everyone else billed like a festival poster.
 */
export function StatsPage(handle: Handle<{ entity: StatsEntity; data: ShowStatsQuery }>) {
  return () => {
    const { entity, data } = handle.props;
    const counts = data.showStats.map((stat) => stat.count);
    const ranks = rankings(counts);
    const leaders = data.leaders
      .slice(0, leaderCount(counts))
      .map((leader, index) => ({ ...leader, rank: ranks[index] ?? index + 1 }));
    const rest = tiers(data.showStats.slice(leaders.length));
    return (
      <article>
        <Header entity={entity} />
        <Totals totals={data.showTotals} />
        {leaders.length > 0 && (
          <ol mix={podium}>
            {leaders.slice(0, 3).map((leader, index) => (
              <PodiumPlace leader={leader} place={index} entity={entity} />
            ))}
          </ol>
        )}
        {leaders.length > 3 && (
          <Leaderboard leaders={leaders.slice(3)} most={leaders[0].count} entity={entity} />
        )}
        {rest.length > 0 && <Lineup tiers={rest} entity={entity} />}
      </article>
    );
  };
}
