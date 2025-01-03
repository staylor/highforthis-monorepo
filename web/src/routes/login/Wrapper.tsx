import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

import { useRootData } from '~/utils/rootData';

const Wrapper = ({ children }: PropsWithChildren) => {
  const { t } = useTranslation();
  const { siteSettings } = useRootData();
  return (
    <div className="block min-h-screen">
      <div className="m-auto w-80 pt-[8%]">
        <h1 className="font-stylized mb-5 block text-5xl font-bold">
          {siteSettings?.siteTitle || t('title')}
        </h1>
        {children}
      </div>
    </div>
  );
};

export default Wrapper;
