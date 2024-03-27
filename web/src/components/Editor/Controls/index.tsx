import cn from 'classnames';
import type { HTMLAttributes } from 'react';

const Controls = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('relative block h-8 w-auto select-none text-sm', className)} {...props} />
);

export default Controls;
