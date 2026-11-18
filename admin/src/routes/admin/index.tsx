import { useRootData } from '@highforthis/shared/web/utils/rootData';

import Analytics from '#/components/Analytics';

export default function Dashboard() {
  const { dashboardSettings } = useRootData();

  return dashboardSettings.googleClientId ? (
    <Analytics googleClientId={dashboardSettings.googleClientId} />
  ) : (
    'You need a Google Client ID to view analytics.'
  );
}
