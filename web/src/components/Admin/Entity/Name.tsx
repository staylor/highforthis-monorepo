import { RowActions, RowTitle, usePath } from '../ListTable';

export default function Name({ data }: { data: any }) {
  const path = usePath();
  const urlPath = `${path}/${data.id}`;

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
