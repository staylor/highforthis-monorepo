import cn from 'classnames';
import type { HTMLAttributes } from 'react';

const Controls = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('relative inline-flex items-center gap-1 text-sm select-none', className)} {...props} />
);

export default Controls;
