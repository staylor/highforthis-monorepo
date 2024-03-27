import type { ReactNode } from 'react';

import Link from '@/components/Link';

interface RowTitleProps {
  url: string;
  title?: ReactNode;
  subtitle?: ReactNode;
}

export default function RowTitle({ url, title, subtitle }: RowTitleProps) {
  return (
    <strong className="mb-1 block break-words text-sm font-bold">
      <Link to={url}>{title || '(no title)'}</Link>
      {subtitle && (
        <>
          <br />
          <span className="text-xs font-normal">{subtitle}</span>
        </>
      )}
    </strong>
  );
}
