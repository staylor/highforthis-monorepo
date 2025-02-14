import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import Link from '~/components/Link';

interface RowTitleProps {
  url: string;
  title?: ReactNode;
  subtitle?: ReactNode;
}

export default function RowTitle({ url, title, subtitle }: RowTitleProps) {
  const { t } = useTranslation();
  return (
    <strong className="mb-1 block break-words text-sm font-bold">
      <Link to={url}>{title || t('table.noTitle')}</Link>
      {subtitle && (
        <>
          <br />
          <span className="text-xs font-normal">{subtitle}</span>
        </>
      )}
    </strong>
  );
}
