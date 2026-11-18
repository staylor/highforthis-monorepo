import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';

import ListTable from '#/components/Admin/ListTable';

const renderList = (url: string) => {
  const router = createMemoryRouter(
    [{ path: '/admin/show', element: <ListTable columns={[]} data={{}} /> }],
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
});
