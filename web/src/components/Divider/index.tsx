import cn from 'classnames';
import type { HTMLAttributes } from 'react';

export default function Divider({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'border-detail mt-6 block border-t pt-6 md:mt-0 md:border-0 md:pt-0',
        className
      )}
      {...props}
    />
  );
}
