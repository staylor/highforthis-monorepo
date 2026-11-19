import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import SelectEntities from '#/components/Admin/Show/SelectEntities';

const wilco = { id: 'a1', name: 'Wilco' };
const spoon = { id: 'a2', name: 'Spoon' };

const submitted = (container: HTMLElement) =>
  [...container.querySelectorAll<HTMLInputElement>('input[type="hidden"]')].map(
    ({ name, value }) => `${name}=${value}`
  );

describe('SelectEntities', () => {
  it('adds the artists picked', async () => {
    const { container } = render(
      <SelectEntities name="artists" nodes={[wilco]} filtered={[wilco, spoon]} />
    );

    await userEvent.selectOptions(screen.getByRole('combobox'), 'Spoon');

    expect(screen.getByRole('button', { name: 'Remove Spoon' })).toBeInTheDocument();
    expect(submitted(container)).toEqual(['artists[0]=a1', 'artists[1]=a2']);
  });

  it('lists an artist once when they are picked again', async () => {
    // the add form starts with the last show's artists, which can be picked again
    const { container } = render(
      <SelectEntities name="artists" nodes={[wilco]} filtered={[wilco, spoon]} />
    );

    await userEvent.selectOptions(screen.getByRole('combobox'), 'Wilco');

    expect(screen.getAllByRole('button', { name: 'Remove Wilco' })).toHaveLength(1);
    expect(submitted(container)).toEqual(['artists[0]=a1']);
  });
});
