import type { AnchorHTMLAttributes, SyntheticEvent } from 'react';
import { Link, type NavLinkProps } from 'react-router';

import { isServedByWeb } from '@highforthis/shared/adminPaths';

export type CustomLinkProps = Pick<NavLinkProps, 'to'> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'onClick'> & {
    onClick?: (e: SyntheticEvent) => void;
  };

export default function CustomLink({ onClick: onClickProp, children, ...props }: CustomLinkProps) {
  const onClick = (e: SyntheticEvent) => {
    if (onClickProp) {
      onClickProp(e as any);
    }

    if (!e.defaultPrevented) {
      document.documentElement.scrollTop = 0;
    }
  };

  // Pages that have moved to the public site's server aren't in this app's router, so they
  // load in full, without prefetching their data from this app.
  if (typeof props.to === 'string' && isServedByWeb(props.to)) {
    return (
      <Link {...props} reloadDocument onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <Link {...props} prefetch="intent" onClick={onClick}>
      {children}
    </Link>
  );
}
