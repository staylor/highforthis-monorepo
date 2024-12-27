import cn from 'classnames';
import type { TdHTMLAttributes } from 'react';

export const Cell = ({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) => (
  <td
    className={cn('border-detail dark:border-detail-dark border px-2 py-1', className)}
    {...props}
  />
);
