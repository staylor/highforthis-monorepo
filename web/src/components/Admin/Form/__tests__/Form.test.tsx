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

  it('adds a sticky mobile action bar when the button lives in the info column', () => {
    const { container } = render(<AdminForm fields={fieldsWithInfo} />);

    const bar = container.querySelector('form > div.sticky');
    expect(bar?.className).toContain('lg:hidden');
    expect(bar?.querySelector('button[type="submit"]')).toBeInTheDocument();
    // the info column keeps its own copy, hidden until there is room for it
    const infoButton = container.querySelector('section button[type="submit"]');
    expect(infoButton?.parentElement?.className).toContain('hidden lg:inline-block');
  });

  it('keeps a single inline button when there is no info column', () => {
    const { container } = render(<AdminForm fields={fields} />);

    expect(container.querySelector('form > div.sticky')).toBeNull();
    expect(container.querySelectorAll('button[type="submit"]')).toHaveLength(1);
  });
});
