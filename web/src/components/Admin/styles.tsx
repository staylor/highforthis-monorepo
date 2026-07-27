import cn from 'classnames';
import type { HTMLAttributes } from 'react';
import { useLocation } from 'react-router';

import { buttonClasses } from '#/components/Button';
import { heading1 } from '#/components/Heading';
import Link, { type CustomLinkProps } from '#/components/Link';

export const Heading = ({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h1
    {...props}
    className={cn('mr-4 mb-4 inline-block align-middle dark:text-white', heading1, className)}
  >
    {children}
  </h1>
);

export const HeaderAdd = ({
  label,
  to,
  ...props
}: Partial<CustomLinkProps> & { label: string }) => {
  const location = useLocation();
  return (
    <Link
      className={buttonClasses(undefined, 'mb-4 align-middle')}
      to={to || `${location.pathname}/add`}
      {...props}
    >
      {label}
    </Link>
  );
};

export const FormWrap = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={cn('block after:clear-both after:table', className)} />
);
