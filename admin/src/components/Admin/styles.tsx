import type { HTMLAttributes, PropsWithChildren } from 'react';

import { heading1 } from '#/components/Heading';
import { cn } from '#/utils/cn';

export const Heading = ({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h1
    {...props}
    className={cn('mr-4 mb-4 inline-block align-middle dark:text-white', heading1, className)}
  >
    {children}
  </h1>
);

export const Alert = ({ children }: PropsWithChildren) => (
  <div
    role="alert"
    className="mb-5 max-w-2xl border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-900 dark:bg-red-950/30 dark:text-red-200"
  >
    {children}
  </div>
);
