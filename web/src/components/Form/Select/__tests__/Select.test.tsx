import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import Select from '@/components/Form/Select';

const placeholder = '-- Select Flavor --';
const flavors = ['Mild', 'Hot', 'Fire'];
const flavorMap = [
  { label: 'Mild', value: 'mild' },
  { label: 'Hot', value: 'hot' },
  { label: 'Fire', value: 'fire' },
];
const tacoMap = [
  { label: 'Crunchy', value: 'crunchy' },
  { label: 'Soft', value: 'soft' },
];
const groups = [
  { label: 'Tacos', choices: tacoMap },
  { label: 'Saunce', choices: flavorMap },
];

describe('select', () => {
  it('empty', () => {
    const { container } = render(<Select />);

    expect(container.firstChild).toMatchSnapshot();
  });

  it('add className', () => {
    // eslint-disable-next-line tailwindcss/no-custom-classname
    const { container } = render(<Select className="foo" />);

    expect(container.firstChild).toMatchSnapshot();
  });

  describe('placeholder', () => {
    it('no choices', () => {
      const { container } = render(<Select placeholder={placeholder} />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('choices', () => {
      const { container } = render(<Select placeholder={placeholder} choices={flavors} />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('choices as objects', () => {
      const { container } = render(<Select placeholder={placeholder} choices={flavorMap} />);

      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('multiple', () => {
    it('true', () => {
      const { container } = render(<Select multiple />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('false', () => {
      const { container } = render(<Select multiple={false} />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('string', () => {
      // @ts-ignore
      const { container } = render(<Select multiple="multiple" />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('truthy', () => {
      // @ts-ignore
      const { container } = render(<Select multiple="1" />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('falsey', () => {
      // @ts-ignore
      const { container } = render(<Select multiple="0" />);

      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('onChange', () => {
    it('value', async () => {
      const user = userEvent.setup();
      const func = vi.fn();
      render(<Select onChange={func} choices={flavorMap} />);
      const value = 'fire';

      await user.selectOptions(screen.getByRole('combobox'), [value]);

      expect(func).toHaveBeenCalledWith(value);
    });

    it('values', async () => {
      const user = userEvent.setup();
      const selectSpy = {
        onChange: () => null,
      };

      const func = vi.spyOn(selectSpy, 'onChange');
      render(<Select multiple onChange={func as any} choices={flavorMap} />);

      await user.selectOptions(screen.getByRole('listbox'), ['mild', 'fire']);

      expect(func).toHaveBeenCalledWith(['mild', 'fire']);
    });
  });

  describe('choices', () => {
    it('choices', () => {
      const { container } = render(<Select choices={flavors} />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('choices as objects', () => {
      const { container } = render(<Select choices={flavorMap} />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('choice', () => {
      const value = 'medium';
      const { container } = render(<Select choices={flavorMap} value={value} />);

      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('groups', () => {
    it('no value', () => {
      const { container } = render(<Select groups={groups} />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('value', () => {
      const value = 'mild';
      const { container } = render(<Select groups={groups} value={value} />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('values', () => {
      const value = ['soft', 'mild'];
      const { container } = render(<Select multiple groups={groups} value={value} />);

      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('child nodes', () => {
    it('children', () => {
      const { container } = render(
        <Select>
          <option value="meximelt">Mexi-melt</option>
        </Select>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('children with choices', () => {
      const { container } = render(
        <Select choices={flavorMap}>
          <option value="meximelt">Mexi-melt</option>
        </Select>
      );

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
