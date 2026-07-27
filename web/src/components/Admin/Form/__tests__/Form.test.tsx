import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import AdminForm from '#/components/Admin/Form';
import type { Fields } from '#/types';

const fields: Fields = [{ label: 'Title', prop: 'title' }];

const fieldsWithInfo: Fields = [
  ...fields,
  { label: 'Slug', prop: 'slug', position: 'info' as const },
];

describe('adminForm', () => {
  it('does not reserve a gutter when there is no info column', () => {
    const { container } = render(<AdminForm fields={fields} />);

    expect(container.querySelector('section')).toBeNull();
    expect(container.querySelector('fieldset')?.className).not.toContain('lg:flex-row');
  });

  it('lays out beside the info column on large screens', () => {
    const { container } = render(<AdminForm fields={fieldsWithInfo} />);

    expect(container.querySelector('fieldset')?.className).toContain('lg:flex-row');
    expect(container.querySelector('section')?.className).toContain('lg:w-70');
  });
});
