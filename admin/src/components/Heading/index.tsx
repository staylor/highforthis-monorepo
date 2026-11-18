import type { HTMLAttributes } from 'react';

import { cn } from '#/utils/cn';

export const headingBase = 'block mb-2 lg:mb-3 dark:text-white';

export const heading1 = 'font-black uppercase text-2xl lg:text-3xl';

export const heading2 = 'font-bold text-2xl';

export const heading3 =
  'font-bold border-pink inline-block border-b-2 border-dashed mt-6 py-1 pl-0.5 pr-6 text-2xl';

export const heading4 = 'font-bold text-lg';

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
