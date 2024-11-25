import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, it, expect } from 'vitest';

import Message from '@/components/Form/Message';

describe('message', () => {
  it('empty', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/foo?message=updated']}>
        <Message />
      </MemoryRouter>
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it('text', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/foo?message=updated']}>
        <Message text="This is an admin message." />
      </MemoryRouter>
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
