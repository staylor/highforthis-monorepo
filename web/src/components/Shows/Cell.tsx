import cn from 'classnames';
import type { TdHTMLAttributes } from 'react';

export const Cell = ({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) => (
  <td
    className={cn('border-detail dark:border-detail-dark border py-1 px-2', className)}
    {...props}
  />
);
