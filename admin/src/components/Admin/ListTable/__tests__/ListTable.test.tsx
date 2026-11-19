import { render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';

import ListTable, { RowActions } from '#/components/Admin/ListTable';

const rows = {
  count: 1,
  pageInfo: { hasNextPage: false },
  edges: [{ node: { id: 'show-1', title: 'A show' } }],
};

const columns = [
  {
    label: 'Title',
    render: (node: { id: string; title: string }) => (
      <>
        {node.title}
        <RowActions actions={[{ type: 'delete' as const, url: '', ids: [node.id] }]} />
      </>
    ),
  },
];

const renderList = (url: string, data: Record<string, any> = {}) => {
  const router = createMemoryRouter(
    [
      {
        path: '/admin/show',
        action: () => null,
        element: <ListTable columns={columns} data={data} />,
      },
    ],
    { initialEntries: [url] }
  );
  return render(<RouterProvider router={router} />);
};

describe('ListTable', () => {
  it('says a delete failed when the list comes back with ?deleteFailed', () => {
    renderList('/admin/show?deleteFailed=2');

    expect(screen.getByText('table.deleteFailed')).toBeInTheDocument();
    expect(screen.getByText('table.noItems')).toBeInTheDocument();
  });

  it('shows no failure message otherwise', () => {
    renderList('/admin/show?deleted=2');

    expect(screen.queryByText('table.deleteFailed')).toBeNull();
  });

  it('applies the chosen bulk action as the form intent', () => {
    renderList('/admin/show', rows);

    const bulk = screen.getByRole('combobox', { name: 'table.bulkActions' });
    expect(bulk).toHaveAttribute('name', 'intent');
    expect(bulk).toHaveValue('');
    const form = bulk.closest('form')!;
    expect(form).toHaveAttribute('method', 'post');
    expect(within(form).getByRole('button', { name: 'table.apply' })).toHaveAttribute(
      'type',
      'submit'
    );
  });

  it('deletes a row from a plain POST form', () => {
    renderList('/admin/show', rows);

    const form = screen.getByRole('button', { name: 'table.delete' }).closest('form')!;
    expect(form).toHaveAttribute('method', 'post');
    expect(form).toHaveFormValues({ intent: 'delete', ids: 'show-1' });
  });
});
