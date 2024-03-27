import type { PropsWithChildren } from 'react';

import { SITE_TITLE } from '@/constants';
import { useRootData } from '@/utils/rootData';

const Wrapper = ({ children }: PropsWithChildren) => {
  const { siteSettings } = useRootData();
  return (
    <div className="block min-h-screen">
      <div className="m-auto w-80 pt-[8%]">
        <h1 className="mb-5 block font-stylized text-5xl font-bold">
          {siteSettings?.siteTitle || SITE_TITLE}
        </h1>
        {children}
      </div>
    </div>
  );
};

export default Wrapper;
