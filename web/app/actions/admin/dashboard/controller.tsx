import type { Handle } from 'remix/component';
import { createAction } from 'remix/router';

import { getAdminT } from '../../../lib/i18n.ts';
import { requireAdmin } from '../../../middleware/admin.ts';
import { routes } from '../../../routes.ts';
import { getAdmin } from '../../../ui/admin/context.tsx';
import { Alert, Heading } from '../../../ui/admin/page.tsx';
import { renderAdminPage } from '../render-page.tsx';

import { loadPageViews, type PageViews as PageViewsData } from './page-views.ts';

// The admin's dashboard: the public site's page views over the last 30 days, from OpenObserve.
// Moved from the admin app's routes/admin/index.tsx and its Dashboard/PageViews.

const formatDate = (date: string) =>
  // Dates are YYYY-MM-DD in the site's time zone; noon UTC keeps them on the same day
  new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
  });

function Stat(handle: Handle<{ label: string; value: number }>) {
  return () => (
    <div class="rounded-lg border border-neutral-200 px-5 py-4 dark:border-white/10">
      <div class="text-sm text-neutral-600 dark:text-neutral-400">{handle.props.label}</div>
      <div class="mt-1 text-3xl font-semibold tabular-nums dark:text-white">
        {handle.props.value.toLocaleString('en-US')}
      </div>
    </div>
  );
}

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
      <figure class="mb-8">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          class="block h-32 w-full"
          role="img"
          aria-label={t('dashboard.chartLabel', { count: days.length })}
        >
          <line
            x1={0}
            x2={width}
            y1={height}
            y2={height}
            class="stroke-neutral-300 dark:stroke-white/20"
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
                class="fill-pink"
              >
                <title>
                  {t('dashboard.viewsOn', { count: day.views, date: formatDate(day.date) })}
                </title>
              </rect>
            );
          })}
        </svg>
        <figcaption class="mt-2 flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
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
      <table class="w-full max-w-2xl text-left text-sm">
        <caption class="mb-2 text-left text-lg font-semibold dark:text-white">
          {t('dashboard.topPages')}
        </caption>
        <thead class="border-b border-neutral-200 text-neutral-600 dark:border-white/10 dark:text-neutral-400">
          <tr>
            <th class="py-2 font-medium">{t('dashboard.page')}</th>
            <th class="py-2 text-right font-medium">{t('dashboard.views')}</th>
          </tr>
        </thead>
        <tbody>
          {handle.props.pages.map(({ path, views }) => (
            <tr key={path} class="border-b border-neutral-100 dark:border-white/5">
              <td class="max-w-0 truncate py-2 pr-4">
                <a
                  class="text-pink hover:underline"
                  href={`${site}${path}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {path}
                </a>
              </td>
              <td class="py-2 text-right tabular-nums dark:text-white">
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
      <section class="max-w-4xl">
        <p class="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
          {t('dashboard.range', { count: days.length })}
        </p>
        <div class="mb-6 grid max-w-md grid-cols-2 gap-4">
          <Stat label={t('dashboard.pageViews')} value={views} />
          <Stat label={t('dashboard.sessions')} value={sessions} />
        </div>
        {views === 0 ? (
          <p class="text-neutral-600 dark:text-neutral-400">{t('dashboard.empty')}</p>
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
