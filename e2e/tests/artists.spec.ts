import { expect, test } from '../support/test.ts';
import { addedId, deleteRow, field, hydrated } from '../support/ui.ts';

test('adds an artist with featured media, edits them, toggles search and deletes them', async ({
  page,
  prefix,
  graphql,
}) => {
  const name = `${prefix} Artist`;

  await page.goto('/admin/artist/add');
  await expect(page.locator('link[href*="/assets/app/styles/public/admin"]')).toHaveCount(1);
  await field(page, 'Name').fill(name);
  await field(page, 'Description').fill('Added by the end-to-end tests');

  // The picker opens once its client entry has hydrated
  const picker = page.getByRole('dialog', { name: 'Media' });
  await hydrated(page);
  await page.getByRole('button', { name: 'Set Featured Media' }).click();
  await expect(picker).toBeVisible();
  // The uploads, and the close button
  const uploads = picker.getByRole('button');
  await expect.poll(() => uploads.count()).toBeGreaterThan(1);
  const firstPage = await uploads.count();
  // Scrolling to the bottom loads the next page
  await expect(async () => {
    await uploads.last().hover();
    await page.mouse.wheel(0, 10_000);
    expect(await uploads.count()).toBeGreaterThan(firstPage);
  }).toPass();
  await uploads.last().click();
  await expect(picker).toBeHidden();
  const picked = await page.locator('input[type="hidden"][name="featuredMedia"]').inputValue();

  await page.getByRole('button', { name: 'Add Artist' }).click();
  await expect(page.getByRole('heading', { name: 'Edit Artist' })).toBeVisible();
  await expect(page.getByText('Artist updated.')).toBeVisible();
  const id = await addedId(page, 'artist');
  const added = await graphql.artist(id);
  expect(added?.name).toBe(name);
  expect(added?.featuredMedia?.map((media) => media.id)).toEqual([picked]);

  await field(page, 'Exclude from search').check();
  await page.getByRole('button', { name: 'Edit Artist' }).click();
  // The message is already showing from the add, so wait for the save itself
  await expect.poll(async () => (await graphql.artist(id))?.excludeFromSearch).toBe(true);
  await page.reload();
  await expect(field(page, 'Exclude from search')).toBeChecked();
  await expect(field(page, 'Description')).toHaveValue('Added by the end-to-end tests');

  await page.goto(`/admin/artist?search=${encodeURIComponent(prefix)}`);
  const row = page.getByRole('row').filter({ hasText: name });
  const toggle = row.getByRole('checkbox', { name: `Exclude from search: ${name}` });
  await expect(toggle).toBeChecked();
  // A click before the box's client entry hydrates is replayed, and saves, once it has
  await toggle.uncheck();
  await expect.poll(async () => (await graphql.artist(id))?.excludeFromSearch).toBe(false);
  await page.reload();
  await expect(toggle).not.toBeChecked();

  // Delete asks first, once its button has hydrated, and Cancel leaves the artist alone
  await hydrated(page);
  page.once('dialog', (dialog) => {
    expect(dialog.message()).toBe("Delete this? It can't be undone.");
    void dialog.dismiss();
  });
  await row.getByRole('button', { name: 'Delete' }).click();
  await expect(row).toBeVisible();
  expect(await graphql.artist(id)).not.toBeNull();

  await deleteRow(page, row);
  await expect(page.getByText('Deleted 1 artist')).toBeVisible();
  await expect(row).toHaveCount(0);
  expect(await graphql.artist(id)).toBeNull();
});
