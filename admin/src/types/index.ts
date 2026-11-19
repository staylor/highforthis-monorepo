import type { IconName } from '#/components/Icon';

export interface AdminRoute {
  path: string;
  label: string;
}

export interface AdminTopLevelRoute extends AdminRoute {
  icon: IconName;
  external?: boolean;
  routes?: AdminRoute[];
}

export type AdminRouteGroup = AdminTopLevelRoute[];
