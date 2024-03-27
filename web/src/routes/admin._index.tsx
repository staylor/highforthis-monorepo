import Analytics from '@/components/Analytics';
import { useRootData } from '@/utils/rootData';

export default function Dashboard() {
  const { dashboardSettings } = useRootData();

  return dashboardSettings.googleClientId ? (
    <Analytics googleClientId={dashboardSettings.googleClientId} />
  ) : (
    'You need a Google Client ID to view analytics.'
  );
}
