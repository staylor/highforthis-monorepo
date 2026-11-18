import { useTranslation } from 'react-i18next';

import PageViews from '#/components/Admin/Dashboard/PageViews';
import { Alert, Heading } from '#/components/Admin/styles';
import { requireAdminSession } from '#/utils/adminSession.server';
import { loadPageViews } from '#/utils/pageViews.server';

import type { Route } from './+types/index';

export async function loader({ request, context }: Route.LoaderArgs) {
  await requireAdminSession({ request, context });
  return loadPageViews();
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  return (
    <>
      <Heading>{t('dashboard.label')}</Heading>
      {loaderData.status === 'ok' && <PageViews pageViews={loaderData.pageViews} />}
      {loaderData.status === 'unconfigured' && <Alert>{t('dashboard.unconfigured')}</Alert>}
      {loaderData.status === 'error' && <Alert>{t('dashboard.error')}</Alert>}
    </>
  );
}
