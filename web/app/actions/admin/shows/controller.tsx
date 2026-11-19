import { createRedirectResponse } from 'remix/response/redirect';
import { createController } from 'remix/router';

import { isRedirect, type RedirectResult } from '../../../lib/admin/forms.ts';
import { getAdminT, type TFunction } from '../../../lib/i18n.ts';
import { requireAdmin, sameOrigin } from '../../../middleware/admin.ts';
import { routes } from '../../../routes.ts';
import type { ShowEditQuery, ShowEntitiesQuery, ShowsAdminQuery } from '../../../types/graphql.ts';
import { AdminForm, type Field } from '../../../ui/admin/form.tsx';
import { documentLoad } from '../../../ui/admin/links.ts';
import { ListTable, RowActions, RowTitle, Search } from '../../../ui/admin/list-table.tsx';
import { Message } from '../../../ui/admin/message.tsx';
import { Alert, HeaderAdd, Heading } from '../../../ui/admin/page.tsx';
import { DateTimeInput } from '../../../ui/admin/public/date-time-input.tsx';
import { EntitiesPicker } from '../../../ui/admin/public/entities-picker.tsx';
import { InlineToggle } from '../../../ui/admin/public/inline-toggle.tsx';
import { buttonClass, inputBase } from '../../../ui/admin/public/styles.ts';
import { cn } from '../../../ui/public/cn.ts';
import { renderAdminPage } from '../render-page.tsx';

import {
  createShow,
  deleteShows,
  importShows,
  loadNewShow,
  loadShow,
  loadShows,
  setShowAttended,
  updateShow,
  type BulkImportErrors,
} from './data.ts';

// Each form route has its own controller, since controller middleware doesn't apply to nested
// route maps.

const shows = routes.admin.shows;

type ShowRow = NonNullable<ShowsAdminQuery['shows']>['edges'][number]['node'];
type ShowFormData = ShowEditQuery | ShowEntitiesQuery;

const backTo = ({ redirectTo }: RedirectResult) => createRedirectResponse(redirectTo, 303);

const pad = (n: number) => String(n).padStart(2, '0');

function showDate(timestamp: number) {
  const d = new Date(timestamp);
  const hours = d.getHours();
  const time = `${hours % 12 || 12}:${pad(d.getMinutes())}${hours < 12 ? 'am' : 'pm'}`;
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()} at ${time}`;
}

/** Where a show is on the public site: its own page, or its one artist's page. */
function publicShowHref(show: ShowRow) {
  if (show.title || show.url || show.artists.length > 1) {
    return routes.shows.show.href({ id: show.id });
  }
  return routes.artist.href({ slug: show.artists[0].slug });
}

interface Entity {
  id: string;
  name: string;
}

/** The artists or venues to pick from, with the ones a show already has, sorted by name. */
function choices(saved: Entity[], connection?: { edges: { node: Entity }[] } | null) {
  const byId = new Map<string, Entity>();
  for (const entity of [...saved, ...(connection?.edges ?? []).map(({ node }) => node)]) {
    byId.set(entity.id, { id: entity.id, name: entity.name });
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** A new show's date before anything sets it: today at 8:00 PM. */
function tonight() {
  const date = new Date();
  date.setHours(20, 0, 0, 0);
  return date.getTime();
}

function showFields(t: TFunction, data: ShowFormData): Field[] {
  const show = data.show;
  const venueId = show?.venue?.id ?? '';
  const venueLink = (href: string, label: string, extra: string) => (
    <a href={href} data-rmx-document={documentLoad(href)} class={cn('text-pink underline', extra)}>
      {label}
    </a>
  );
  return [
    { label: t('shows.title'), prop: 'title' },
    {
      label: t('shows.date'),
      prop: 'date',
      type: 'custom',
      render: () => <DateTimeInput name="date" value={show?.date ?? tonight()} id="field-date" />,
    },
    {
      label: t('shows.artists'),
      prop: 'artists',
      type: 'custom',
      render: () => (
        <EntitiesPicker
          name="artists"
          selected={(show?.artists ?? []).map(({ id, name }) => ({ id, name }))}
          choices={choices(show?.artists ?? [], data.artists)}
          placeholder="---"
          removeLabel={t('admin.remove')}
          id="field-artists"
        />
      ),
    },
    {
      label: t('shows.venue'),
      prop: 'venue',
      type: 'custom',
      render: () => (
        <>
          <select
            name="venue"
            id="field-venue"
            aria-label={t('shows.venue')}
            class={cn(inputBase, 'rounded-lg border-neutral-300 bg-white text-sm')}
          >
            <option value="">---</option>
            {choices(show?.venue ? [show.venue] : [], data.venues).map((venue) => (
              <option value={venue.id} selected={venue.id === venueId}>
                {venue.name}
              </option>
            ))}
          </select>
          <p class="mt-2 mb-8">
            {venueLink(routes.admin.venues.add.index.href(), t('entity.add.venue'), 'ml-2')}
            {venueId &&
              venueLink(
                routes.admin.venues.edit.index.href({ id: venueId }),
                t('entity.edit.venue'),
                'ml-4'
              )}
          </p>
        </>
      ),
    },
    { label: t('shows.url'), prop: 'url', inputType: 'url' },
    { label: t('shows.notes'), prop: 'notes', type: 'textarea' },
    { label: t('shows.attended.label'), prop: 'attended', type: 'checkbox' },
  ];
}

export const showsList = createController(shows.list, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: {
    async index(context) {
      const t = getAdminT();
      const { searchParams } = context.url;
      const { shows: connection } = await loadShows({ gql: context.admin.gql, searchParams });
      const deleted = Number(searchParams.get('deleted') || 0);
      const imported = Number(searchParams.get('imported') || 0);
      const columns = [
        {
          label: t('shows.title'),
          render: (show: ShowRow) => {
            const href = shows.edit.index.href({ id: show.id });
            return (
              <>
                <RowTitle href={href} title={show.title} />
                <RowActions editHref={href} id={show.id} />
              </>
            );
          },
        },
        {
          label: t('shows.artists'),
          render: (show: ShowRow) => {
            const [first] = show.artists;
            const href = routes.admin.artists.edit.index.href({ id: first.id });
            const more = show.artists.length > 1 ? ` + ${show.artists.length - 1}` : '';
            return (
              <>
                <RowTitle href={href} title={`${first.name}${more}`} />
                <RowActions editHref={href} viewHref={publicShowHref(show)} />
              </>
            );
          },
        },
        {
          label: t('shows.venue'),
          render: ({ venue }: ShowRow) => {
            const href = routes.admin.venues.edit.index.href({ id: venue.id });
            return (
              <>
                <RowTitle href={href} title={venue.name} />
                <RowActions editHref={href} viewHref={routes.venue.href({ slug: venue.slug })} />
              </>
            );
          },
        },
        {
          label: t('shows.attended.label'),
          class: 'text-center',
          render: (show: ShowRow) => (
            <InlineToggle
              intent="attended"
              name="attended"
              id={show.id}
              checked={Boolean(show.attended)}
              label={`${t('shows.attended.label')}: ${show.title || show.artists[0].name}`}
            />
          ),
        },
        { label: t('shows.date'), render: (show: ShowRow) => showDate(show.date) },
      ];

      return renderAdminPage(
        context,
        <>
          <Heading>{t('shows.heading')}</Heading>
          <HeaderAdd href={shows.add.index.href()} label={t('shows.add')} />{' '}
          <HeaderAdd href={shows.bulk.index.href()} label={t('shows.bulk.nav')} />
          {deleted > 0 && <Message param="deleted" text={t('shows.deleted', { count: deleted })} />}
          {imported > 0 && (
            <Message
              param="imported"
              text={t('shows.bulk.success', {
                count: imported,
                artistsCreated: Number(searchParams.get('artistsCreated') || 0),
                venuesCreated: Number(searchParams.get('venuesCreated') || 0),
              })}
            />
          )}
          <Search placeholder={t('shows.search')} />
          <ListTable connection={connection} columns={columns} />
        </>,
        { title: t('shows.heading') }
      );
    },

    // The row and bulk delete forms post intent=delete, and a row's "attended" box posts
    // intent=attended with fetch, which only needs to hear whether it saved. Apply with no
    // action chosen posts an empty intent and just comes back to the list.
    async action(context) {
      const formData = await context.request.formData();
      const intent = formData.get('intent');
      if (intent === 'delete') {
        return backTo(await deleteShows({ gql: context.admin.gql, formData, url: context.url }));
      }
      if (intent === 'attended') {
        const saved = await setShowAttended({ gql: context.admin.gql, formData });
        return new Response(null, { status: saved ? 204 : 500 });
      }
      return createRedirectResponse(`${context.url.pathname}${context.url.search}`, 303);
    },
  },
});

export const showsAdd = createController(shows.add, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: {
    async index(context) {
      const t = getAdminT();
      // The form starts out like the last show added, artists included
      const data = await loadNewShow({ gql: context.admin.gql });
      const label = t('shows.add');
      return renderAdminPage(
        context,
        <>
          <Heading>{label}</Heading>
          <Message text={t('shows.updated')} />
          <AdminForm fields={showFields(t, data)} data={data.show} buttonLabel={label} />
        </>,
        { title: label }
      );
    },

    async action(context) {
      const formData = await context.request.formData();
      return backTo(await createShow({ gql: context.admin.gql, formData, url: context.url }));
    },
  },
});

export const showsEdit = createController(shows.edit, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: {
    async index(context) {
      const t = getAdminT();
      const data = await loadShow({ gql: context.admin.gql, id: context.params.id });
      if (!data.show) {
        return renderAdminPage(context, <Heading>{t('table.noItems')}</Heading>, { status: 404 });
      }
      const label = t('shows.edit');
      return renderAdminPage(
        context,
        <>
          <Heading>{label}</Heading>
          <HeaderAdd href={shows.add.index.href()} label={t('shows.add')} />
          <Message text={t('shows.updated')} />
          <AdminForm
            fields={showFields(t, data)}
            data={data.show}
            buttonLabel={t('shows.update')}
          />
        </>,
        { title: label }
      );
    },

    async action(context) {
      const formData = await context.request.formData();
      return backTo(
        await updateShow({
          gql: context.admin.gql,
          id: context.params.id,
          formData,
          url: context.url,
        })
      );
    },
  },
});

const exampleCsv =
  'artists,venue,date,attended\n"Artist One; Artist Two","The Venue",8/15/26,false\nArtist Three,"Venue, Inc.",5/10/24,true';

function bulkPage(t: TFunction, result?: BulkImportErrors) {
  const errors = result?.errors ?? [];
  return (
    <>
      <Heading>{t('shows.bulk.heading')}</Heading>
      <HeaderAdd href={shows.list.index.href()} label={t('shows.all')} />
      <div class="mb-5 max-w-2xl text-sm text-neutral-700 dark:text-neutral-300">
        <p>{t('shows.bulk.description')}</p>
        <p class="mt-2">
          {t('shows.bulk.formatLabel')} <code>{t('shows.bulk.format')}</code>
        </p>
        <p class="mt-2">{t('shows.bulk.artistsHelp')}</p>
        <p class="mt-2">{t('shows.bulk.dateHelp')}</p>
        <pre class="mt-3 overflow-x-auto rounded-md bg-neutral-100 p-3 text-xs leading-5 dark:bg-white/10">
          {exampleCsv}
        </pre>
      </div>
      {errors.length > 0 && (
        <Alert>
          <p class="font-semibold">{t('shows.bulk.errors')}</p>
          <ul class="mt-1 list-disc pl-5">
            {errors.map((error) => (
              <li>{t('shows.bulk.lineError', error)}</li>
            ))}
          </ul>
        </Alert>
      )}
      <form method="post">
        <label for="bulk-shows" class="mb-1 block text-sm tracking-wide text-gray-700">
          {t('shows.bulk.csv')}
        </label>
        <textarea
          id="bulk-shows"
          name="csv"
          rows={14}
          required
          spellcheck={false}
          value={result?.csv ?? ''}
          class={cn(inputBase, 'w-full max-w-2xl font-mono text-sm')}
        />
        <div class="mt-3">
          <button type="submit" class={buttonClass(true, 'h-7.5 px-3 pb-0.5 leading-7')}>
            {t('shows.bulk.submit')}
          </button>
        </div>
      </form>
    </>
  );
}

export const showsBulk = createController(shows.bulk, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: {
    index(context) {
      const t = getAdminT();
      return renderAdminPage(context, bulkPage(t), {
        title: t('shows.bulk.heading'),
      });
    },

    // Comes back to the form with its errors, or goes to the list, which says what was imported
    async action(context) {
      const t = getAdminT();
      const formData = await context.request.formData();
      const result = await importShows({ gql: context.admin.gql, formData });
      if (isRedirect(result)) {
        return backTo(result);
      }
      return renderAdminPage(context, bulkPage(t, result), {
        title: t('shows.bulk.heading'),
        status: 422,
      });
    },
  },
});
