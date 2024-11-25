import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import Input from '~/components/Form/Input';

const TEXT_VALUE = 'Run for the border.';

describe('input', () => {
  it('empty', () => {
    const { container } = render(<Input />);

    expect(container.firstChild).toMatchSnapshot();
    expect((container.firstChild as HTMLInputElement).value).toBe('');
  });

  it('add className', () => {
    const { container } = render(<Input className="foo" />);

    expect(container.firstChild).toMatchSnapshot();
  });

  describe('onChange', () => {
    it('adding text', async () => {
      const user = userEvent.setup();
      const func = vi.fn();
      const value = TEXT_VALUE;
      render(<Input onChange={func} />);

      await user.type(screen.getByRole('textbox'), value);

      expect(func).toHaveBeenCalledTimes(value.length);
    });

    it('removing text', async () => {
      const user = userEvent.setup();
      const func = vi.fn();
      const value = TEXT_VALUE;
      render(<Input onChange={func} value={value} />);

      await user.type(screen.getByRole('textbox'), 'f');

      expect(func).toHaveBeenCalledWith(value + 'f');
    });
  });
});
