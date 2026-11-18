import debounce from 'lodash.debounce';

import Input from '#/components/Form/Input';

import { useUpdateQuery } from './utils';

export default function Search({ placeholder }: { placeholder: string }) {
  const { updateQuery, searchParams } = useUpdateQuery();
  const querySearch = updateQuery('search');
  const updateSearch = debounce(querySearch, 600);

  return (
    <div className="mb-2 w-full sm:float-right sm:w-64">
      <Input
        value={searchParams.get('search') || ''}
        placeholder={placeholder}
        onChange={updateSearch}
      />
    </div>
  );
}
