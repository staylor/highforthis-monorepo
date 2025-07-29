import cn from 'classnames';
import type { HTMLAttributes } from 'react';

const Controls = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('relative block h-8 w-auto text-sm select-none', className)} {...props} />
);

export default Controls;
