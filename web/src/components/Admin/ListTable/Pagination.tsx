import cn from 'classnames';
import type { PropsWithChildren } from 'react';
import { useLocation, useSearchParams } from 'react-router';

import Link from '~/components/Link';

const textClass = cn(
  'border border-detail',
  'inline-block text-base leading-none font-normal mx-0.5 pt-0.5 px-1.5 pb-1 rounded-sm text-center select-none'
);

const Count = ({ children }: PropsWithChildren) => (
  <strong className="mx-1 inline-block select-none px-2 text-center font-normal">{children}</strong>
);

interface PaginationProps {
  data: Record<string, any>;
  perPage: number;
  className: string;
}

export default function Pagination({ data, perPage, className }: PaginationProps) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const page = searchParams.get('page');
  const pages = data.count > 0 ? Math.ceil(data.count / perPage) : 0;
  const firstPage = pages === 0 ? 0 : 1;
  const currentPage = page ? Number(page) : firstPage;
  const paginated = currentPage && currentPage > 1;
  let previousPage = null;
  let nextPage = null;
  if (paginated) {
    if (currentPage - 1 > 1) {
      previousPage = currentPage - 1;
    } else {
      previousPage = 0;
    }
  }
  if (currentPage !== pages && data.pageInfo.hasNextPage) {
    nextPage = currentPage + 1;
  }

  const LinkTo = ({
    page,
    className,
    children,
  }: PropsWithChildren<{
    page?: number;
    className: string;
  }>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page) {
      params.set('page', String(page));
    } else if (page === 0) {
      params.delete('page');
    }
    return (
      <Link className={className} to={{ pathname: location.pathname, search: params.toString() }}>
        {children}
      </Link>
    );
  };

  const Inactive = ({ children }: PropsWithChildren) => (
    <span className={cn(textClass, 'bg-neutral-50')}>{children}</span>
  );

  const Active = ({ page, children }: PropsWithChildren<{ page?: number }>) => (
    <LinkTo
      className={cn(textClass, 'text-dark hover:bg-detail bg-white hover:text-black')}
      page={page}
    >
      {children}
    </LinkTo>
  );

  return (
    <nav className={cn('select-none text-sm', className)}>
      <Count>{data.count} items</Count>
      {paginated ? <Active>«</Active> : <Inactive>«</Inactive>}
      {previousPage === null ? <Inactive>‹</Inactive> : <Active page={previousPage}>‹</Active>}
      <Count>
        {paginated ? currentPage : firstPage} of {pages}
      </Count>
      {nextPage === null ? <Inactive>›</Inactive> : <Active page={nextPage}>›</Active>}
      {currentPage !== pages ? <Active page={pages}>»</Active> : <Inactive>»</Inactive>}
    </nav>
  );
}
