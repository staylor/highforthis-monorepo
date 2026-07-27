import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import Textarea from '#/components/Form/Textarea';

const TEXT_VALUE = 'Run for the border.';

describe('textarea', () => {
  it('empty', () => {
    const { container } = render(<Textarea />);

    expect(container.firstChild).toMatchSnapshot();
  });

  it('add className', () => {
    const { container } = render(<Textarea className="foo" />);

    expect(container.firstChild).toMatchSnapshot();
  });

  describe('singleLine', () => {
    it('blocks line breaks from the keyboard', async () => {
      const user = userEvent.setup();
      render(<Textarea singleLine autoGrow value="Title" />);

      const input = screen.getByRole('textbox');
      await user.type(input, '{Enter}more');

      expect(input).toHaveValue('Titlemore');
    });

    it('flattens pasted line breaks', async () => {
      const user = userEvent.setup();
      render(<Textarea singleLine autoGrow />);

      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.paste('One\nTwo');

      expect(input).toHaveValue('One Two');
    });

    it('allows line breaks without the prop', async () => {
      const user = userEvent.setup();
      render(<Textarea />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'One{Enter}Two');

      expect(input).toHaveValue('One\nTwo');
    });
  });

  describe('onChange', () => {
    it('adding text', async () => {
      const user = userEvent.setup();
      const func = vi.fn();
      render(<Textarea onChange={func} />);
      const value = TEXT_VALUE;

      await user.type(screen.getByRole('textbox'), value);

      expect(func).toHaveBeenCalledTimes(value.length);
    });

    it('removing text', async () => {
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
