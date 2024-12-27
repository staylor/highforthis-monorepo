import cn from 'classnames';
import type { HTMLAttributes } from 'react';

export default function TextTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      {...props}
      className={cn(
        'mb-2 block text-3xl font-semibold tracking-wide text-neutral-800 lg:mb-3 dark:text-white',
        className
      )}
    />
  );
}
