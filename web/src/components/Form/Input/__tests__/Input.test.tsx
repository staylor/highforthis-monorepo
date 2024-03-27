import { describe, expect, test, vi } from 'vitest';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Input from '@/components/Form/Input';

const TEXT_VALUE = 'Run for the border.';

describe('Input', () => {
  test('empty', () => {
    const { container } = render(<Input />);

    expect(container.firstChild).toMatchSnapshot();
    expect((container.firstChild as HTMLInputElement).value).toEqual('');
  });

  test('add className', () => {
    // eslint-disable-next-line tailwindcss/no-custom-classname
    const { container } = render(<Input className="foo" />);

    expect(container.firstChild).toMatchSnapshot();
  });

  describe('onChange', () => {
    test('adding text', async () => {
      const user = userEvent.setup();
      const func = vi.fn();
      const value = TEXT_VALUE;
      render(<Input onChange={func} />);

      await user.type(screen.getByRole('textbox'), value);

      expect(func).toHaveBeenCalledTimes(value.length);
    });

    test('removing text', async () => {
      const user = userEvent.setup();
      const func = vi.fn();
      const value = TEXT_VALUE;
      render(<Input onChange={func} value={value} />);

      await user.type(screen.getByRole('textbox'), 'f');

      expect(func).toHaveBeenCalledWith(value + 'f');
    });
  });
});
