import type { TdHTMLAttributes } from 'react';
import cn from 'classnames';

export const Cell = ({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) => (
  <td
    className={cn('border-detail dark:border-detail-dark border py-1 px-2', className)}
    {...props}
  />
);
