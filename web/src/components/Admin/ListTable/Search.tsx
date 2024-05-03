import debounce from 'lodash.debounce';

import Input from '@/components/Form/Input';

import { useUpdateQuery } from './utils';

export default function Search({ placeholder }: { placeholder: string }) {
  const { updateQuery, searchParams } = useUpdateQuery();
  const querySearch = updateQuery('search');
  const updateSearch = debounce(querySearch, 600);

  return (
    <div className="float-right">
      <Input
        value={searchParams.get('search') || ''}
        placeholder={placeholder}
        onChange={updateSearch}
      />
    </div>
  );
}
