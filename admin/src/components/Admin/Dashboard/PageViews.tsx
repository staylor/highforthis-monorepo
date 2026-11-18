import { useTranslation } from 'react-i18next';

import { useRootData } from '@highforthis/shared/utils/rootData';

import type { PageViews as PageViewsData } from '#/utils/pageViews.server';

const formatDate = (date: string, options: Intl.DateTimeFormatOptions) =>
  // Dates are YYYY-MM-DD in the site's time zone; noon UTC keeps them on the same day
  new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', { timeZone: 'UTC', ...options });

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-neutral-200 px-5 py-4 dark:border-white/10">
      <div className="text-sm text-neutral-600 dark:text-neutral-400">{label}</div>
      <div className="mt-1 text-3xl font-semibold tabular-nums dark:text-white">
        {value.toLocaleString('en-US')}
      </div>
    </div>
  );
}

function DailyChart({ days }: { days: PageViewsData['days'] }) {
  const { t } = useTranslation();
  const max = Math.max(1, ...days.map((day) => day.views));
  const height = 120;
  const barWidth = 10;
  const gap = 4;
  const width = days.length * (barWidth + gap) - gap;
  return (
    <figure className="mb-8">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="block h-32 w-full"
        role="img"
        aria-label={t('dashboard.chartLabel', { count: days.length })}
      >
        <line
          x1={0}
          x2={width}
          y1={height}
          y2={height}
          className="stroke-neutral-300 dark:stroke-white/20"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
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
              className="fill-pink"
            >
              <title>
                {t('dashboard.viewsOn', {
                  count: day.views,
                  date: formatDate(day.date, { month: 'short', day: 'numeric' }),
                })}
              </title>
            </rect>
          );
        })}
      </svg>
      <figcaption className="mt-2 flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
        <span>{formatDate(days[0].date, { month: 'short', day: 'numeric' })}</span>
        <span>{t('dashboard.peak', { count: max })}</span>
        <span>{formatDate(days[days.length - 1].date, { month: 'short', day: 'numeric' })}</span>
      </figcaption>
    </figure>
  );
}

function TopPages({ pages }: { pages: PageViewsData['topPages'] }) {
  const { t } = useTranslation();
  const { siteSettings } = useRootData();
  const siteUrl = (siteSettings?.siteUrl ?? '').replace(/\/$/, '');
  return (
    <table className="w-full max-w-2xl text-left text-sm">
      <caption className="mb-2 text-left text-lg font-semibold dark:text-white">
        {t('dashboard.topPages')}
      </caption>
      <thead className="border-b border-neutral-200 text-neutral-600 dark:border-white/10 dark:text-neutral-400">
        <tr>
          <th className="py-2 font-medium">{t('dashboard.page')}</th>
          <th className="py-2 text-right font-medium">{t('dashboard.views')}</th>
        </tr>
      </thead>
      <tbody>
        {pages.map(({ path, views }) => (
          <tr key={path} className="border-b border-neutral-100 dark:border-white/5">
            <td className="max-w-0 truncate py-2 pr-4">
              <a
                className="text-pink hover:underline"
                href={`${siteUrl}${path}`}
                target="_blank"
                rel="noreferrer"
              >
                {path}
              </a>
            </td>
            <td className="py-2 text-right tabular-nums dark:text-white">
              {views.toLocaleString('en-US')}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function PageViews({ pageViews }: { pageViews: PageViewsData }) {
  const { t } = useTranslation();
  const { days, views, sessions, topPages } = pageViews;
  return (
    <section className="max-w-4xl">
      <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
        {t('dashboard.range', { count: days.length })}
      </p>
      <div className="mb-6 grid max-w-md grid-cols-2 gap-4">
        <Stat label={t('dashboard.pageViews')} value={views} />
        <Stat label={t('dashboard.sessions')} value={sessions} />
      </div>
      {views === 0 ? (
        <p className="text-neutral-600 dark:text-neutral-400">{t('dashboard.empty')}</p>
      ) : (
        <>
          <DailyChart days={days} />
          <TopPages pages={topPages} />
        </>
      )}
    </section>
  );
}
