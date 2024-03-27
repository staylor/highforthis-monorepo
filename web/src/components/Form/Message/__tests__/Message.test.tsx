import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import Message from '@/components/Form/Message';

describe('Message', () => {
  test('empty', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/foo?message=updated']}>
        <Message />
      </MemoryRouter>
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  test('text', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/foo?message=updated']}>
        <Message text="This is an admin message." />
      </MemoryRouter>
    );

    expect(container.firstChild).toMatchSnapshot();
  });
});
