import { css } from 'remix/component';
import { createController } from 'remix/router';

import {
  backTo,
  formActions,
  listAction,
  renderAdminNotFound,
  renderAdminPage,
  type AdminContext,
  type AdminEditContext,
} from '#/actions/admin/render-page.tsx';
import { dateTime } from '#/lib/admin/date-time.ts';
import { isRedirect, type SaveFailure } from '#/lib/admin/forms.ts';
import { getAdminT, type TFunction } from '#/lib/i18n.ts';
import { requireAdmin, sameOrigin } from '#/middleware/admin.ts';
import { routes } from '#/routes.ts';
import type { ShowEditQuery, ShowEntitiesQuery, ShowsAdminQuery } from '#/types/graphql.ts';
import { AdminForm, type Field } from '#/ui/admin/form.tsx';
import { documentLoad } from '#/ui/admin/links.ts';
import { ListTable, Search, TitleCell, toggleColumn } from '#/ui/admin/list-table.tsx';
import { Message } from '#/ui/admin/message.tsx';
import { Alert, HeaderAdd, Heading } from '#/ui/admin/page.tsx';
import { DateTimeInput } from '#/ui/admin/public/date-time-input.tsx';
import { EntitiesPicker } from '#/ui/admin/public/entities-picker.tsx';
import { input, saveButton, select } from '#/ui/admin/public/styles.ts';
import { merge, text } from '#/ui/public/styles.ts';
import { formatArtists, formatShowLink } from '#/ui/shows/utils.ts';

import {
  createShow,
  deleteShows,
  importShows,
  loadNewShow,
  loadShow,
  loadShows,
  saveShowFlag,
  updateShow,
  type BulkImportErrors,
} from './data.ts';

// Each form route has its own controller, since controller middleware doesn't apply to nested
// route maps.

const shows = routes.admin.shows;

type ShowRow = NonNullable<ShowsAdminQuery['shows']>['edges'][number]['node'];
type ShowFormData = ShowEditQuery | ShowEntitiesQuery;

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

function showFields(t: TFunction, data: ShowFormData, values?: SaveFailure['values']): Field[] {
  const show = data.show;
  const artists = choices(show?.artists ?? [], data.artists);
  // What a save that failed submitted, or what's saved
  const venueId: string = values ? (values.venue ?? '') : (show?.venue?.id ?? '');
  const date = values?.date ? Number(values.date) : (show?.date ?? tonight());
  const picked: Entity[] = values
    ? [values.artists ?? []]
        .flat()
        .flatMap((id) => artists.find((artist) => artist.id === id) ?? [])
    : (show?.artists ?? []).map(({ id, name }) => ({ id, name }));
  const venueLink = (href: string, label: string, marginLeft: string) => (
    <a
      href={href}
      data-rmx-document={documentLoad(href)}
      mix={css({ marginLeft, color: 'var(--pink)', textDecoration: 'underline' })}
    >
      {label}
    </a>
  );
  return [
    { label: t('shows.title'), prop: 'title' },
    {
      label: t('shows.date'),
      prop: 'date',
      type: 'custom',
      render: () => (
        <DateTimeInput name="date" value={date} id="field-date" hint={t('admin.newYorkTime')} />
      ),
    },
    {
      label: t('shows.artists'),
      prop: 'artists',
      type: 'custom',
      render: () => (
        <EntitiesPicker
          name="artists"
          selected={picked}
          choices={artists}
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
          <select name="venue" id="field-venue" aria-label={t('shows.venue')} mix={select}>
            <option value="">---</option>
            {choices(show?.venue ? [show.venue] : [], data.venues).map((venue) => (
              <option value={venue.id} selected={venue.id === venueId}>
                {venue.name}
              </option>
            ))}
          </select>
          <p mix={css({ marginBlock: '0.5rem 2rem' })}>
            {venueLink(routes.admin.venues.add.index.href(), t('entity.add.venue'), '0.5rem')}
            {venueId &&
              venueLink(
                routes.admin.venues.edit.index.href({ id: venueId }),
                t('entity.edit.venue'),
                '1rem'
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
      const columns = [
        {
          label: t('shows.title'),
          render: (show: ShowRow) => (
            <TitleCell
              href={shows.edit.index.href({ id: show.id })}
              title={show.title}
              id={show.id}
            />
          ),
        },
        {
          label: t('shows.artists'),
          render: (show: ShowRow) => {
            const [first] = show.artists;
            // A show's artists can all have been deleted
            if (!first) {
              return t('shows.noArtists');
            }
            const more = show.artists.length > 1 ? ` + ${show.artists.length - 1}` : '';
            return (
              <TitleCell
                href={routes.admin.artists.edit.index.href({ id: first.id })}
                title={`${first.name}${more}`}
                viewHref={formatShowLink(show)}
              />
            );
          },
        },
        {
          label: t('shows.venue'),
          render: ({ venue }: ShowRow) => (
            <TitleCell
              href={routes.admin.venues.edit.index.href({ id: venue.id })}
              title={venue.name}
              viewHref={routes.venue.href({ slug: venue.slug })}
            />
          ),
        },
        toggleColumn('attended', t('shows.attended.label'), (show: ShowRow) => formatArtists(show)),
        { label: t('shows.date'), render: (show: ShowRow) => dateTime(show.date) },
      ];

      return renderAdminPage(
        context,
        <>
          <Heading>{t('shows.heading')}</Heading>
          <HeaderAdd href={shows.add.index.href()} label={t('shows.add')} />{' '}
          <HeaderAdd href={shows.bulk.index.href()} label={t('shows.bulk.nav')} />
          <Message param="deleted" text={(count) => t('shows.deleted', { count })} />
          <Message
            param="imported"
            text={(count) =>
              t('shows.bulk.success', {
                count,
                artistsCreated: Number(searchParams.get('artistsCreated') || 0),
                venuesCreated: Number(searchParams.get('venuesCreated') || 0),
              })
            }
          />
          <Search placeholder={t('shows.search')} />
          <ListTable connection={connection} columns={columns} />
        </>,
        { title: t('shows.heading') }
      );
    },

    action: listAction(deleteShows, { flags: ['attended'], save: saveShowFlag }),
  },
});

async function addPage(context: AdminContext, failure?: SaveFailure) {
  const t = getAdminT();
  // The form starts out like the last show added, artists included
  const data = await loadNewShow({ gql: context.admin.gql });
  const label = t('shows.add');
  return renderAdminPage(
    context,
    <>
      <Heading>{label}</Heading>
      <AdminForm
        fields={showFields(t, data, failure?.values)}
        data={data.show}
        failure={failure}
        buttonLabel={label}
      />
    </>,
    { title: label, status: failure?.status }
  );
}

export const showsAdd = createController(shows.add, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: formActions(addPage, createShow),
});

async function editPage(context: AdminEditContext, failure?: SaveFailure) {
  const t = getAdminT();
  const data = await loadShow({ gql: context.admin.gql, id: context.params.id });
  if (!data.show) {
    return renderAdminNotFound(context);
  }
  const label = t('shows.edit');
  return renderAdminPage(
    context,
    <>
      <Heading>{label}</Heading>
      <HeaderAdd href={shows.add.index.href()} label={t('shows.add')} />
      <Message text={t('shows.updated')} hidden={Boolean(failure)} />
      <AdminForm
        fields={showFields(t, data, failure?.values)}
        data={data.show}
        failure={failure}
        buttonLabel={t('shows.update')}
      />
    </>,
    { title: label, status: failure?.status }
  );
}

export const showsEdit = createController(shows.edit, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: formActions(editPage, updateShow),
});

const exampleCsv =
  'artists,venue,date,attended\n"Artist One; Artist Two","The Venue",8/15/26,false\nArtist Three,"Venue, Inc.",5/10/24,true';

function bulkPage(t: TFunction, result?: BulkImportErrors) {
  const errors = result?.errors ?? [];
  return (
    <>
      <Heading>{t('shows.bulk.heading')}</Heading>
      <HeaderAdd href={shows.list.index.href()} label={t('shows.all')} />
      <div
        mix={css({
          marginBottom: '1.25rem',
          maxWidth: '42rem',
          ...text.sm,
          color: 'var(--neutral-700)',
          '& p + p': { marginTop: '0.5rem' },
        })}
      >
        <p>{t('shows.bulk.description')}</p>
        <p>
          {t('shows.bulk.formatLabel')} <code>{t('shows.bulk.format')}</code>
        </p>
        <p>{t('shows.bulk.artistsHelp')}</p>
        <p>{t('shows.bulk.dateHelp')}</p>
        <pre
          mix={css({
            marginTop: '0.75rem',
            overflowX: 'auto',
            borderRadius: '0.375rem',
            backgroundColor: 'var(--neutral-100)',
            padding: '0.75rem',
            ...text.xs,
            lineHeight: '1.25rem',
          })}
        >
          {exampleCsv}
        </pre>
      </div>
      {errors.length > 0 && (
        <Alert>
          <p mix={css({ fontWeight: 600 })}>{t('shows.bulk.errors')}</p>
          <ul mix={css({ marginTop: '0.25rem', listStyleType: 'disc', paddingLeft: '1.25rem' })}>
            {errors.map((error) => (
              <li>{t('shows.bulk.lineError', error)}</li>
            ))}
          </ul>
        </Alert>
      )}
      <form method="post">
        <label
          for="bulk-shows"
          mix={css({
            marginBottom: '0.25rem',
            display: 'block',
            ...text.sm,
            letterSpacing: '0.025em',
            color: 'var(--gray-700)',
          })}
        >
          {t('shows.bulk.csv')}
        </label>
        <textarea
          id="bulk-shows"
          name="csv"
          rows={14}
          required
          spellcheck={false}
          value={result?.csv ?? ''}
          mix={css(
            merge(input, {
              width: '100%',
              maxWidth: '42rem',
              fontFamily: 'var(--font-mono)',
              ...text.sm,
            })
          )}
        />
        <div mix={css({ marginTop: '0.75rem' })}>
          <button type="submit" mix={saveButton}>
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
