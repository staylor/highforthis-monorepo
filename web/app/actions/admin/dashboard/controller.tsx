import { css, type Handle } from 'remix/component';
import { createAction } from 'remix/router';

import { renderAdminPage } from '#/actions/admin/render-page.tsx';
import { getAdminT } from '#/lib/i18n.ts';
import { requireAdmin } from '#/middleware/admin.ts';
import { routes } from '#/routes.ts';
import { getAdmin } from '#/ui/admin/context.tsx';
import { Alert, Heading } from '#/ui/admin/page.tsx';
import { dark, text } from '#/ui/public/styles.ts';

import { loadPageViews, type PageViews as PageViewsData } from './page-views.ts';

// The public site's page views over the last 30 days, from OpenObserve.

const formatDate = (date: string) =>
  // Dates are YYYY-MM-DD in the site's time zone; noon UTC keeps them on the same day
  new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
  });

// Gray text, lighter in dark mode
const secondary = { color: 'var(--neutral-600)', [dark]: { color: 'var(--neutral-400)' } };
const white = { [dark]: { color: '#fff' } };

function Stat(handle: Handle<{ label: string; value: number }>) {
  return () => (
    <div
      mix={css({
        borderRadius: '0.5rem',
        border: '1px solid var(--neutral-200)',
        padding: '1rem 1.25rem',
        [dark]: { borderColor: 'rgb(255 255 255 / 0.1)' },
      })}
    >
      <div mix={css({ ...text.sm, ...secondary })}>{handle.props.label}</div>
      <div
        mix={css({
          marginTop: '0.25rem',
          ...text['3xl'],
          fontWeight: 600,
          fontVariantNumeric: 'tabular-nums',
          ...white,
        })}
      >
        {handle.props.value.toLocaleString('en-US')}
      </div>
    </div>
  );
}

const bar = css({ fill: 'var(--pink)' });

function DailyChart(handle: Handle<{ days: PageViewsData['days'] }>) {
  return () => {
    const { t } = getAdmin(handle);
    const { days } = handle.props;
    const max = Math.max(1, ...days.map((day) => day.views));
    const height = 120;
    const barWidth = 10;
    const gap = 4;
    const width = days.length * (barWidth + gap) - gap;
    return (
      <figure mix={css({ marginBottom: '2rem' })}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          mix={css({ display: 'block', height: '8rem', width: '100%' })}
          role="img"
          aria-label={t('dashboard.chartLabel', { count: days.length })}
        >
          <line
            x1={0}
            x2={width}
            y1={height}
            y2={height}
            mix={css({
              stroke: 'var(--neutral-300)',
              [dark]: { stroke: 'rgb(255 255 255 / 0.2)' },
            })}
            stroke-width={1}
            vector-effect="non-scaling-stroke"
          />
          {days.map((day, index) => {
            const barHeight = (day.views / max) * height;
            return (
              <rect
                key={day.date}
                x={index * (barWidth + gap)}
                y={height - barHeight}
                width={barWidth}
                height={Math.max(barHeight, day.views > 0 ? 1 : 0)}
                mix={bar}
              >
                <title>
                  {t('dashboard.viewsOn', { count: day.views, date: formatDate(day.date) })}
                </title>
              </rect>
            );
          })}
        </svg>
        <figcaption
          mix={css({
            marginTop: '0.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            ...text.xs,
            color: 'var(--neutral-500)',
            [dark]: { color: 'var(--neutral-400)' },
          })}
        >
          <span>{formatDate(days[0].date)}</span>
          <span>{t('dashboard.peak', { count: max })}</span>
          <span>{formatDate(days[days.length - 1].date)}</span>
        </figcaption>
      </figure>
    );
  };
}

function TopPages(handle: Handle<{ pages: PageViewsData['topPages'] }>) {
  return () => {
    const { t, siteUrl } = getAdmin(handle);
    const site = siteUrl.replace(/\/$/, '');
    return (
      <table mix={css({ width: '100%', maxWidth: '42rem', textAlign: 'left', ...text.sm })}>
        <caption
          mix={css({
            marginBottom: '0.5rem',
            textAlign: 'left',
            ...text.lg,
            fontWeight: 600,
            ...white,
          })}
        >
          {t('dashboard.topPages')}
        </caption>
        <thead
          mix={css({
            borderBottom: '1px solid var(--neutral-200)',
            ...secondary,
            [dark]: { borderColor: 'rgb(255 255 255 / 0.1)', color: 'var(--neutral-400)' },
          })}
        >
          <tr>
            <th mix={css({ paddingBlock: '0.5rem', fontWeight: 500 })}>{t('dashboard.page')}</th>
            <th mix={css({ paddingBlock: '0.5rem', textAlign: 'right', fontWeight: 500 })}>
              {t('dashboard.views')}
            </th>
          </tr>
        </thead>
        <tbody>
          {handle.props.pages.map(({ path, views }) => (
            <tr
              key={path}
              mix={css({
                borderBottom: '1px solid var(--neutral-100)',
                [dark]: { borderColor: 'rgb(255 255 255 / 0.05)' },
              })}
            >
              <td
                mix={css({
                  maxWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  paddingBlock: '0.5rem',
                  paddingRight: '1rem',
                })}
              >
                <a
                  mix={css({ color: 'var(--pink)', '&:hover': { textDecoration: 'underline' } })}
                  href={`${site}${path}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {path}
                </a>
              </td>
              <td
                mix={css({
                  paddingBlock: '0.5rem',
                  textAlign: 'right',
                  fontVariantNumeric: 'tabular-nums',
                  ...white,
                })}
              >
                {views.toLocaleString('en-US')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };
}

function PageViews(handle: Handle<{ pageViews: PageViewsData }>) {
  return () => {
    const { t } = getAdmin(handle);
    const { days, views, sessions, topPages } = handle.props.pageViews;
    return (
      <section mix={css({ maxWidth: '56rem' })}>
        <p mix={css({ marginBottom: '1rem', ...text.sm, ...secondary })}>
          {t('dashboard.range', { count: days.length })}
        </p>
        <div
          mix={css({
            marginBottom: '1.5rem',
            display: 'grid',
            maxWidth: '28rem',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '1rem',
          })}
        >
          <Stat label={t('dashboard.pageViews')} value={views} />
          <Stat label={t('dashboard.sessions')} value={sessions} />
        </div>
        {views === 0 ? (
          <p mix={css(secondary)}>{t('dashboard.empty')}</p>
        ) : (
          <>
            <DailyChart days={days} />
            <TopPages pages={topPages} />
          </>
        )}
      </section>
    );
  };
}

export const dashboard = createAction(routes.admin.dashboard, {
  middleware: [requireAdmin()],
  async handler(context) {
    const t = getAdminT();
    const result = await loadPageViews();
    return renderAdminPage(
      context,
      <>
        <Heading>{t('dashboard.label')}</Heading>
        {result.status === 'ok' && <PageViews pageViews={result.pageViews} />}
        {result.status === 'unconfigured' && <Alert>{t('dashboard.unconfigured')}</Alert>}
        {result.status === 'error' && <Alert>{t('dashboard.error')}</Alert>}
      </>,
      { title: t('dashboard.label') }
    );
  },
});
