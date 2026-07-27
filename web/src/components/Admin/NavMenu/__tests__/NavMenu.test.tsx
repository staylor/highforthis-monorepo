import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';

import NavMenu, { AdminNavProvider } from '#/components/Admin/NavMenu';

const Harness = () => (
  <AdminNavProvider>
    <NavMenu.MobileToggle />
    <NavMenu />
  </AdminNavProvider>
);

const renderNav = (pathname: string) => {
  const router = createMemoryRouter([{ id: 'root', path: '*', element: <Harness /> }], {
    initialEntries: [pathname],
    hydrationData: {
      loaderData: { root: { data: { siteSettings: { siteUrl: 'https://highforthis.com' } } } },
    },
  });
  return render(<RouterProvider router={router} />);
};

describe('admin navMenu', () => {
  it('renders the top level routes', () => {
    renderNav('/admin');

    // dashboard, view site, logout, ...
    expect(screen.getAllByRole('link').length).toBeGreaterThan(5);
    expect(screen.getAllByText('posts.heading')).toHaveLength(2); // sidebar + drawer
  });

  it('expands the sub nav of the active section', () => {
    renderNav('/admin/show/add');

    expect(screen.getAllByText('shows.all').length).toBeGreaterThan(0);
    // an inactive section stays closed
    expect(screen.queryByText('users.all')).toBeNull();
  });

  it('toggles the mobile drawer', () => {
    renderNav('/admin');

    const toggle = screen.getByLabelText('nav.menu');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    // the closed drawer is inert, so nothing inside it is focusable
    expect(screen.getByTestId('admin-nav-drawer')).toHaveAttribute('inert');

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('admin-nav-drawer')).not.toHaveAttribute('inert');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('collapses the desktop rail', () => {
    renderNav('/admin');

    const collapse = screen.getByLabelText('nav.collapse');
    fireEvent.click(collapse);
    expect(screen.getByLabelText('nav.expand')).toBeInTheDocument();
  });
});
