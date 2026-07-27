import type { ReactNode } from 'react';

import type { Choice } from '#/components/Form/Select';
import type { IconName } from '#/components/Icon';

export interface Column {
  className?: string;
  label?: string;
  prop?: string;
  render?: (data: any) => ReactNode;
  type?: string;
}

export type Columns = Column[];

export type Fields = FieldUnion[];

export type FieldUnion = Field | FieldFactory;

export type FieldFactory = (data: Record<string, any>) => Field;

export interface Field {
  autoComplete?: boolean;
  choices?: Choice[];
  className?: string;
  condition?: (data: any) => boolean;
  defaultValue?: string | number;
  editable?: boolean;
  inputType?: string;
  label?: string;
  multiple?: boolean;
  name?: string;
  placeholder?: string;
  position?: 'info' | 'meta' | 'primary';
  prop?: string;
  render?: (data: any) => ReactNode;
  type?: 'custom' | 'date' | 'editor' | 'heading' | 'select' | 'textarea' | 'hidden';
}

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
