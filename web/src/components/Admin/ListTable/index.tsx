import type { ReactNode, ChangeEvent } from 'react';
import { useReducer } from 'react';
import cn from 'classnames';
import { useSubmit } from '@remix-run/react';

import Select from '@/components/Form/Select';
import Checkbox from '@/components/Form/Checkbox';
import type { Column, Columns } from '@/types';

import Pagination from './Pagination';
import { formatDate, usePath } from './utils';

export { default as RowTitle } from './RowTitle';
export { default as RowActions } from './RowActions';
export { default as Thumbnail } from './Thumbnail';
export { usePath };

const cellHeading = cn('text-sm py-2 px-2.5 text-left');

interface HeadersProps {
  className?: string;
  checkClass?: string;
  columns: Columns;
  checked: boolean;
  toggleAll: (e: ChangeEvent<HTMLInputElement>) => void;
}

const Headers = ({ className, checkClass, columns, checked, toggleAll }: HeadersProps) => (
  <tr>
    <th className={cn(cellHeading, className, 'w-9', checkClass)}>
      <Checkbox checked={checked} onChange={toggleAll} />
    </th>
    {columns.map((column, i) => (
      <th className={cn(cellHeading, className, column.className)} key={`${i.toString(16)}`}>
        {column.label}
      </th>
    ))}
  </tr>
);

interface ListTableProps {
  data: AppData;
  deletable?: boolean;
  columns: Columns;
  filters?: ReactNode;
  perPage?: number;
}

interface ListState {
  checked: string[];
  all: boolean;
}

const reducer = (a: ListState, b: Partial<ListState>) => ({ ...a, ...b });

function ListTable({
  data = {},
  deletable = true,
  columns,
  filters,
  perPage = 20,
}: ListTableProps) {
  const path = usePath();
  const submit = useSubmit();
  const [state, setState] = useReducer(reducer, {
    checked: [],
    all: false,
  });

  function handleChange(e: ChangeEvent<HTMLFormElement>) {
    e.preventDefault();

    if (e.currentTarget.bulkActions.value === 'deleteAll') {
      submit(e.currentTarget, { method: 'delete' });
    }
  }

  const toggleAll = (e: ChangeEvent<HTMLInputElement>) => {
    const checkbox = e.target as HTMLInputElement;
    let ids;
    if (checkbox.checked) {
      ids = data.edges.map(({ node }: AppData) => node.id);
    } else {
      ids = [];
    }
    setState({ checked: ids, all: checkbox.checked });
  };

  const toggleCheck = (e: ChangeEvent<HTMLInputElement>) => {
    const checkbox = e.target as HTMLInputElement;
    if (!checkbox.value) {
      return;
    }

    const ids = [...state.checked];
    let { all } = state;
    if (checkbox.checked) {
      ids.push(checkbox.value);
    } else {
      all = false;
      ids.splice(ids.indexOf(checkbox.value), 1);
    }

    setState({ checked: ids, all });
  };

  if (!data || !data.edges || !data.edges.length) {
    return <p className="my-10">No items found.</p>;
  }

  const paginationMatrix = (
    <Pagination data={data} path={path} perPage={perPage} className="text-right" />
  );
  const toolbarClass = cn('flex items-center');

  return (
    <>
      <section className={cn(toolbarClass, 'my-1.5')}>
        <div className="flex grow">
          {deletable && (
            <form method="delete" onChange={handleChange}>
              {state.checked.map((id: string) => (
                <input key={id} type="hidden" name="ids" value={id} />
              ))}
              <Select
                key="bulk"
                name="bulkActions"
                placeholder="Bulk Actions"
                choices={[{ label: 'Delete', value: 'deleteAll' }]}
              />
            </form>
          )}
          {filters}
        </div>
        {paginationMatrix}
      </section>
      <table className="w-full table-fixed border-spacing-0 border border-detail shadow">
        <thead>
          <Headers
            className="border-b border-detail"
            checkClass="border-b border-detail"
            columns={columns}
            checked={state.all}
            toggleAll={toggleAll}
          />
        </thead>
        <tbody>
          {data.edges.map(({ node }: AppData) => (
            <tr className="even:bg-neutral-50" key={node.id}>
              <th className={cn(cellHeading, 'py-1.5 px-2.5 align-top')}>
                <Checkbox
                  className="align-text-top"
                  checked={state.checked.includes(node.id)}
                  value={node.id}
                  onChange={toggleCheck}
                />
              </th>
              {columns.map((column: Column, i) => {
                let content = null;
                if (column.type && column.type === 'date') {
                  content = column.prop && node[column.prop] ? formatDate(node[column.prop]) : null;
                } else {
                  content = column.render ? column.render(node) : column.prop && node[column.prop];
                }
                return (
                  <td
                    key={`${i.toString(16)}`}
                    className={cn('break-words py-2 px-2.5 align-top text-sm', column.className)}
                  >
                    {content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <Headers
            className="border-t border-detail"
            checkClass="border-t border-detail"
            columns={columns}
            checked={state.all}
            toggleAll={toggleAll}
          />
        </tfoot>
      </table>
      <section className={cn(toolbarClass, 'my-4 justify-end')}>{paginationMatrix}</section>
    </>
  );
}

export default ListTable;
