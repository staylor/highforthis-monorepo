import { css, type Handle } from 'remix/component';
import { createAction } from 'remix/router';

import { renderAdminPage } from '#/actions/admin/render-page.tsx';
import { getAdminT } from '#/lib/i18n.ts';
import { requireAdmin } from '#/middleware/admin.ts';
import { routes } from '#/routes.ts';
import { getAdmin } from '#/ui/admin/context.tsx';
import { Alert, Heading } from '#/ui/admin/page.tsx';
import { text, xl } from '#/ui/public/styles.ts';

import { loadPageViews, type PageViews as PageViewsData } from './page-views.ts';
import {
  formatDuration,
  formatShare,
  loadPerformance,
  rate,
  type Performance as PerformanceData,
  type Rating,
  type VitalName,
} from './performance.ts';

// How the public site has performed over the last week, and its page views over the last 30
// days, from OpenObserve.

const formatDate = (date: string) =>
  // Dates are YYYY-MM-DD in the site's time zone; noon UTC keeps them on the same day
  new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
  });

// Gray text
const secondary = { color: 'var(--neutral-600)' };

const card = css({
  borderRadius: '0.5rem',
  border: '1px solid var(--neutral-200)',
  padding: '1rem 1.25rem',
});

const sectionHeading = css({ marginBottom: '0.25rem', ...text.lg, fontWeight: 600 });

function Stat(handle: Handle<{ label: string; value: number }>) {
  return () => (
    <div mix={card}>
      <div mix={css({ ...text.sm, ...secondary })}>{handle.props.label}</div>
      <div
        mix={css({
          marginTop: '0.25rem',
          ...text['3xl'],
          fontWeight: 600,
          fontVariantNumeric: 'tabular-nums',
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
            mix={css({ stroke: 'var(--neutral-300)' })}
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
          })}
        >
          {t('dashboard.topPages')}
        </caption>
        <thead
          mix={css({
            borderBottom: '1px solid var(--neutral-200)',
            ...secondary,
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

// An em dash where there's nothing to show
const none = '—';

// Each rating's dot. The rating is also written out, so color isn't the only cue.
const ratingColor: Record<Rating, string> = {
  good: 'var(--green-700)',
  needsImprovement: 'var(--amber-600)',
  poor: 'var(--red-600)',
};

function Metric(handle: Handle<{ label: string; value: string; detail: string; rating?: Rating }>) {
  return () => {
    const { t } = getAdmin(handle);
    const { label, value, detail, rating } = handle.props;
    return (
      <div mix={card}>
        <div mix={css({ ...text.sm, ...secondary })}>{label}</div>
        <div
          mix={css({
            marginTop: '0.25rem',
            ...text['2xl'],
            fontWeight: 600,
            fontVariantNumeric: 'tabular-nums',
          })}
        >
          {value}
        </div>
        <div
          mix={css({
            marginTop: '0.25rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            columnGap: '0.5rem',
            ...text.xs,
            ...secondary,
          })}
        >
          {rating && (
            <span
              mix={css({
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontWeight: 500,
                color: 'var(--neutral-900)',
              })}
            >
              <span
                mix={css({
                  width: '0.5rem',
                  height: '0.5rem',
                  borderRadius: '9999px',
                  backgroundColor: ratingColor[rating],
                })}
              />
              {t(`dashboard.${rating}`)}
            </span>
          )}
          <span>{detail}</span>
        </div>
      </div>
    );
  };
}

const metricGroup = css({ marginBottom: '0.5rem', ...text.sm, fontWeight: 500, ...secondary });
// Two rows of two, or one row of four once the cards have room for their labels, so no card
// sits on a row alone
const metricGrid = css({
  marginBottom: '1.5rem',
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '1rem',
  [xl]: { gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' },
});

function Performance(handle: Handle<{ performance: PerformanceData }>) {
  return () => {
    const { t } = getAdmin(handle);
    const { days, vitals, pages, errors, graphql } = handle.props.performance;
    const vital = (name: VitalName, samples: string) => {
      const { value } = vitals[name];
      if (value === null) {
        return { value: none, detail: t('dashboard.noData') };
      }
      return {
        value: name === 'cls' ? value.toFixed(2) : formatDuration(value),
        detail: samples,
        rating: rate(name, value),
      };
    };
    const duration = (ms: number | null) => (ms === null ? none : formatDuration(ms));
    const pagesServed = pages.count
      ? t('dashboard.pagesServed', { count: pages.count })
      : t('dashboard.noData');
    return (
      <section mix={css({ marginBottom: '2.5rem', maxWidth: '56rem' })}>
        <h2 mix={sectionHeading}>{t('dashboard.performance')}</h2>
        <p mix={css({ marginBottom: '1.25rem', ...text.sm, ...secondary })}>
          {t('dashboard.performanceRange', { count: days })}
        </p>
        <h3 mix={metricGroup}>{t('dashboard.visitors')}</h3>
        <div mix={metricGrid}>
          <Metric
            label={t('dashboard.lcp')}
            {...vital('lcp', t('dashboard.loads', { count: vitals.lcp.samples }))}
          />
          <Metric
            label={t('dashboard.inp')}
            {...vital('inp', t('dashboard.interactions', { count: vitals.inp.samples }))}
          />
          <Metric
            label={t('dashboard.cls')}
            {...vital('cls', t('dashboard.viewCount', { count: vitals.cls.samples }))}
          />
          <Metric
            label={t('dashboard.ttfb')}
            {...vital('ttfb', t('dashboard.loads', { count: vitals.ttfb.samples }))}
          />
        </div>
        <h3 mix={metricGroup}>{t('dashboard.server')}</h3>
        <div mix={metricGrid}>
          <Metric label={t('dashboard.pageP50')} value={duration(pages.p50)} detail={pagesServed} />
          <Metric label={t('dashboard.pageP95')} value={duration(pages.p95)} detail={pagesServed} />
          <Metric
            label={t('dashboard.serverErrors')}
            value={errors.requests ? formatShare(errors.count, errors.requests) : none}
            detail={
              errors.requests
                ? t('dashboard.errorsOf', { errors: errors.count, requests: errors.requests })
                : t('dashboard.noData')
            }
          />
          <Metric
            label={t('dashboard.graphql')}
            value={duration(graphql.p95)}
            detail={
              graphql.calls ? t('dashboard.calls', { count: graphql.calls }) : t('dashboard.noData')
            }
          />
        </div>
      </section>
    );
  };
}

function PageViews(handle: Handle<{ pageViews: PageViewsData }>) {
  return () => {
    const { t } = getAdmin(handle);
    const { days, views, sessions, topPages } = handle.props.pageViews;
    return (
      <section mix={css({ maxWidth: '56rem' })}>
        <h2 mix={sectionHeading}>{t('dashboard.traffic')}</h2>
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
    const [pageViews, performance] = await Promise.all([loadPageViews(), loadPerformance()]);
    return renderAdminPage(
      context,
      <>
        <Heading>{t('dashboard.label')}</Heading>
        {/* Both come from OpenObserve, so they're set up together */}
        {pageViews.status === 'unconfigured' ? (
          <Alert>{t('dashboard.unconfigured')}</Alert>
        ) : (
          <>
            {performance.status === 'ok' && <Performance performance={performance.performance} />}
            {performance.status === 'error' && <Alert>{t('dashboard.performanceError')}</Alert>}
            {pageViews.status === 'ok' && <PageViews pageViews={pageViews.pageViews} />}
            {pageViews.status === 'error' && <Alert>{t('dashboard.error')}</Alert>}
          </>
        )}
      </>,
      { title: t('dashboard.label') }
    );
  },
});
