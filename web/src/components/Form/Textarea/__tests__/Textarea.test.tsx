import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Textarea from '@/components/Form/Textarea';

const TEXT_VALUE = 'Run for the border.';

describe('Textarea', () => {
  test('empty', () => {
    const { container } = render(<Textarea />);

    expect(container.firstChild).toMatchSnapshot();
  });

  test('add className', () => {
    // eslint-disable-next-line tailwindcss/no-custom-classname
    const { container } = render(<Textarea className="foo" />);

    expect(container.firstChild).toMatchSnapshot();
  });

  describe('onChange', () => {
    test('adding text', async () => {
      const user = userEvent.setup();
      const func = vi.fn();
      render(<Textarea onChange={func} />);
      const value = TEXT_VALUE;

      await user.type(screen.getByRole('textbox'), value);

      expect(func).toHaveBeenCalledTimes(value.length);
    });

    test('removing text', async () => {
      const user = userEvent.setup();
      const func = vi.fn();
      const value = TEXT_VALUE;
      render(<Textarea onChange={func} value={value} />);

      const input = screen.getByRole('textbox');

      await user.type(input, `{Backspace>${TEXT_VALUE.length}/}`);

      expect(input).toHaveValue('');
    });
  });
});
