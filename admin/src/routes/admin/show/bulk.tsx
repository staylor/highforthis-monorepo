import { useTranslation } from 'react-i18next';

import { FormWrap, HeaderAdd, Heading } from '#/components/Admin/styles';
import Button from '#/components/Button';
import Textarea from '#/components/Form/Textarea';
import { importShows } from '#/server/shows';
import { graphqlClient, respond } from '#/utils/route.server';

import type { Route } from './+types/bulk';

export async function action({ request, context }: Route.ActionArgs) {
  const gql = graphqlClient({ request, context });
  return respond(await importShows({ gql, formData: await request.formData() }));
}

export default function BulkShowAdd({ actionData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const errors = actionData?.errors ?? [];

  return (
    <>
      <Heading>{t('shows.bulk.heading')}</Heading>
      <HeaderAdd label={t('shows.all')} to="/admin/show" />
      <div className="mb-5 max-w-2xl text-sm text-neutral-700 dark:text-neutral-300">
        <p>{t('shows.bulk.description')}</p>
        <p className="mt-2">
          {t('shows.bulk.formatLabel')} <code>{t('shows.bulk.format')}</code>
        </p>
        <p className="mt-2">{t('shows.bulk.artistsHelp')}</p>
        <p className="mt-2">{t('shows.bulk.dateHelp')}</p>
        <pre className="mt-3 overflow-x-auto rounded-md bg-neutral-100 p-3 text-xs leading-5 dark:bg-white/10">
          {
            'artists,venue,date,attended\n"Artist One; Artist Two","The Venue",8/15/26,false\nArtist Three,"Venue, Inc.",5/10/24,true'
          }
        </pre>
      </div>

      {errors.length > 0 && (
        <div
          role="alert"
          className="mb-5 max-w-2xl border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-900 dark:bg-red-950/30 dark:text-red-200"
        >
          <p className="font-semibold">{t('shows.bulk.errors')}</p>
          <ul className="mt-1 list-disc pl-5">
            {errors.map((error, index) => (
              <li key={`${error.line}-${index}`}>{t('shows.bulk.lineError', error)}</li>
            ))}
          </ul>
        </div>
      )}

      <FormWrap>
        <form method="post">
          <label htmlFor="bulk-shows" className="mb-1 block text-sm tracking-wide text-gray-700">
            {t('shows.bulk.csv')}
          </label>
          <Textarea
            id="bulk-shows"
            name="csv"
            rows={14}
            required
            spellCheck={false}
            value={actionData?.csv}
            className="max-w-2xl font-mono text-sm"
          />
          <div className="mt-3">
            <Button buttonType="primary" type="submit" className="h-7.5 px-3 pb-0.5 leading-7">
              {t('shows.bulk.submit')}
            </Button>
          </div>
        </form>
      </FormWrap>
    </>
  );
}
