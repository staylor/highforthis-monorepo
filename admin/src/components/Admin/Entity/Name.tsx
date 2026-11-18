import { useLocation } from 'react-router';

import { RowActions, RowTitle } from '../ListTable';

export default function Name({ data }: { data: any }) {
  const location = useLocation();
  const urlPath = `${location.pathname}/${data.id}`;

  return (
    <>
      <RowTitle url={urlPath} title={data.name} />
      <RowActions
        actions={[
          { type: 'edit', url: urlPath },
          { type: 'delete', url: urlPath, ids: [data.id] },
        ]}
      />
    </>
  );
}
