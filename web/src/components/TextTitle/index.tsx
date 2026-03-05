import cn from 'classnames';
import type { HTMLAttributes } from 'react';

export default function TextTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      {...props}
      className={cn(
        'font-display mb-2 block text-3xl font-semibold lg:mb-3 dark:text-white',
        className
      )}
    >
      {children}
    </h2>
  );
}
