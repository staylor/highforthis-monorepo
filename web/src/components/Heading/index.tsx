import cn from 'classnames';
import type { HTMLAttributes } from 'react';

export const headingBase =
  'block font-semibold mb-2 lg:mb-3 tracking-wide text-neutral-800 dark:text-white';

const heading1 = 'text-3xl lg:text-4xl';

export const heading2 = 'text-2xl';

export const heading3 =
  'border-pink inline-block border-b-2 border-dashed mt-6 py-1 pl-0.5 pr-6 text-2xl';

export const heading4 = 'text-lg';

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

export const Heading3 = ({ className, children, ...props }: HeadingProps) => (
  <h3 className={cn(headingBase, heading3, className)} {...props}>
    {children}
  </h3>
);

export const Heading4 = ({ className, children, ...props }: HeadingProps) => (
  <h4 className={cn(headingBase, heading4, className)} {...props}>
    {children}
  </h4>
);
