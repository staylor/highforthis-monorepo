import type { HTMLAttributes } from 'react';

import { cn } from '#/utils/cn';

const Controls = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('relative inline-flex items-center gap-1 text-sm select-none', className)}
    {...props}
  />
);

export default Controls;
