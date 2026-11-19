import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import AdminForm from '#/components/Admin/Form';
import type { Fields } from '#/types';

const fields: Fields = [{ label: 'Title', prop: 'title' }];

const fieldsWithInfo: Fields = [
  ...fields,
  { label: 'Slug', prop: 'slug', position: 'info' as const },
];

// The form says when the last save failed, which the page's URL tells it
const renderForm = (formFields: Fields, url = '/admin/thing/1') =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <AdminForm fields={formFields} />
    </MemoryRouter>
  );

describe('adminForm', () => {
  it('says the save failed when the page comes back with ?saveFailed', () => {
    renderForm(fields, '/admin/thing/1?saveFailed=1');

    expect(screen.getByText('admin.saveFailed')).toBeInTheDocument();
  });

  it('shows no failure message otherwise', () => {
    renderForm(fields, '/admin/thing/1?message=updated');

    expect(screen.queryByText('admin.saveFailed')).toBeNull();
  });

  it('does not reserve a gutter when there is no info column', () => {
    const { container } = renderForm(fields);

    expect(container.querySelector('section')).toBeNull();
    expect(container.querySelector('fieldset')?.className).not.toContain('lg:flex-row');
  });

  it('lays out beside the info column on large screens', () => {
    const { container } = renderForm(fieldsWithInfo);

    expect(container.querySelector('fieldset')?.className).toContain('lg:flex-row');
    expect(container.querySelector('section')?.className).toContain('lg:w-70');
  });

  it('adds a sticky mobile action bar when the button lives in the info column', () => {
    const { container } = renderForm(fieldsWithInfo);

    const bar = container.querySelector('form > div.sticky');
    expect(bar?.className).toContain('lg:hidden');
    expect(bar?.querySelector('button[type="submit"]')).toBeInTheDocument();
    // the info column keeps its own copy, hidden until there is room for it
    const infoButton = container.querySelector('section button[type="submit"]');
    expect(infoButton?.parentElement?.className).toContain('hidden lg:inline-block');
  });

  it('keeps a single inline button when there is no info column', () => {
    const { container } = renderForm(fields);

    expect(container.querySelector('form > div.sticky')).toBeNull();
    expect(container.querySelectorAll('button[type="submit"]')).toHaveLength(1);
  });
});
