import type { AnchorHTMLAttributes, SyntheticEvent } from 'react';
import { Link, type NavLinkProps } from '@remix-run/react';

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

  return (
    <Link {...props} prefetch="intent" onClick={onClick}>
      {children}
    </Link>
  );
}
