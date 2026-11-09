import { render, screen } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import { describe, expect, it } from 'vitest';

import ShowRoute from '../show';

function renderShow(date: Date) {
  const show = {
    artists: [{ appleMusic: null, id: 'artist-1', name: 'Chat Pile', slug: 'chat-pile' }],
    date: date.getTime(),
    id: 'show-1',
    title: null,
    url: null,
    venue: { id: 'venue-1', name: 'Brooklyn Steel', slug: 'brooklyn-steel' },
  };
  const Stub = createRoutesStub([
    { path: '/shows/:id', Component: ShowRoute, loader: () => ({ show }) },
  ]);
  render(<Stub initialEntries={['/shows/show-1']} />);
}

describe('show page', () => {
  it('prints the day of the month', async () => {
    renderShow(new Date(2026, 9, 2, 20, 0));

    await expect(screen.findByText('October 2, 2026 - 8:00PM')).resolves.toBeInTheDocument();
  });

  it('prints noon as 12PM', async () => {
    renderShow(new Date(2026, 9, 2, 12, 30));
    await expect(screen.findByText('October 2, 2026 - 12:30PM')).resolves.toBeInTheDocument();
  });

  it('prints midnight as 12AM', async () => {
    renderShow(new Date(2026, 9, 3, 0, 0));
    await expect(screen.findByText('October 3, 2026 - 12:00AM')).resolves.toBeInTheDocument();
  });
});
