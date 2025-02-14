import cn from 'classnames';
import type { HTMLAttributes } from 'react';
import { useLocation } from 'react-router';

import Link, { type CustomLinkProps } from '~/components/Link';

export const Heading = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h1
    {...props}
    className={cn(
      'font-stylized mb-4 mr-2 inline-block pb-1 pt-2 text-2xl font-normal tracking-wide',
      className
    )}
  />
);

export const HeaderAdd = ({
  label,
  to,
  ...props
}: Partial<CustomLinkProps> & { label: string }) => {
  const location = useLocation();
  return (
    <Link
      className={cn(
        'relative z-10 cursor-pointer bg-[#ededed] px-2 py-1 font-bold outline-0',
        'border-detail -top-0.75 rounded-sm border text-sm'
      )}
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
