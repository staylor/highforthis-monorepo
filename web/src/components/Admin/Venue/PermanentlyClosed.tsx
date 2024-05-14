import { useFetcher } from 'react-router-dom';

import Checkbox from '@/components/Form/Checkbox';

export default function PermanentlyClosed({ data }: any) {
  const fetcher = useFetcher();
  const { id, permanentlyClosed } = data;
  return (
    <Checkbox
      checked={Boolean(permanentlyClosed)}
      onChange={(e) => {
        fetcher.submit(
          {
            id,
            permanentlyClosed: e.target.checked,
            formAction: 'permanentlyClosed',
          },
          {
            method: 'POST',
          }
        );
      }}
    />
  );
}
