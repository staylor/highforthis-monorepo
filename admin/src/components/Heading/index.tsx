import type { HTMLAttributes } from 'react';

import { cn } from '#/utils/cn';

const headingBase = 'block mb-2 lg:mb-3 dark:text-white';

export const heading1 = 'font-black uppercase text-2xl lg:text-3xl';

const heading2 = 'font-bold text-2xl';

type HeadingProps = HTMLAttributes<HTMLHeadingElement>;

export const Heading1 = ({ className, children, ...props }: HeadingProps) => (
  <h1 className={cn(headingBase, heading1, className)} {...props}>
    {children}
  </h1>
);

export const Heading2 = ({ className, children, ...props }: HeadingProps) => (
  <h2 className={cn(headingBase, heading2, className)} {...props}>
    {children}
  </h2>
);
