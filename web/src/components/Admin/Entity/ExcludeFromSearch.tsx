import { useFetcher } from 'react-router-dom';

import Checkbox from '~/components/Form/Checkbox';

export default function ExcludeFromSearch({ data }: any) {
  const fetcher = useFetcher();
  const { id, excludeFromSearch } = data;
  return (
    <Checkbox
      checked={Boolean(excludeFromSearch)}
      onChange={(e) => {
        fetcher.submit(
          {
            id,
            excludeFromSearch: e.target.checked,
            formAction: 'excludeFromSearch',
          },
          {
            method: 'POST',
          }
        );
      }}
    />
  );
}
