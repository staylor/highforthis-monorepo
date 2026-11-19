import type { Page } from '@playwright/test';

import { expect, test } from '../support/test.ts';
import { addedId, field, hydrated } from '../support/ui.ts';

// The image and audio pickers are client entries.

/** Opens the picker with this button, picks its first upload and says which one it was. */
async function pick(page: Page, button: string, input: string) {
  const picker = page.getByRole('dialog', { name: 'Media' });
  // The picker opens once its client entry has hydrated
  await hydrated(page);
  await page.getByRole('button', { name: button }).click();
  await expect(picker).toBeVisible();
  // The uploads, and the close button
  const uploads = picker.getByRole('button');
  await expect.poll(() => uploads.count()).toBeGreaterThan(1);
  await uploads.nth(1).click();
  await expect(picker).toBeHidden();
  return page.locator(`input[type="hidden"][name="${input}"]`).inputValue();
}

test('adds a podcast with an image and audio, edits it and deletes it', async ({
  page,
  prefix,
  graphql,
}) => {
  const title = `${prefix} Podcast`;

  await page.goto('/admin/podcast/add');
  await expect(page.locator('link[href*="/assets/app/styles/public/admin"]')).toHaveCount(1);
  await field(page, 'Title').fill(title);
  const image = await pick(page, 'Set Image', 'image');
  const audio = await pick(page, 'Set Audio', 'audio');
  // The picked audio plays in the form
  await expect(page.locator('audio')).toHaveCount(1);

  await page.getByRole('button', { name: 'Add Podcast' }).click();
  await expect(page.getByRole('heading', { name: 'Edit Podcast' })).toBeVisible();
  await expect(page.getByText('Podcast updated.')).toBeVisible();
  const id = await addedId(page, 'podcast');
  expect(await graphql.podcast(id)).toMatchObject({
    title,
    image: { id: image },
    audio: { id: audio },
  });

  await field(page, 'Description').fill('Added by the end-to-end tests');
  await page.getByRole('button', { name: 'Update Podcast' }).click();
  // The message is already showing from the add, so wait for the save itself
  await expect
    .poll(async () => (await graphql.podcast(id))?.description)
    .toBe('Added by the end-to-end tests');
  // The image and audio stay when the form is saved again
  expect(await graphql.podcast(id)).toMatchObject({ image: { id: image }, audio: { id: audio } });

  await page.goto(`/admin/podcast?search=${encodeURIComponent(prefix)}`);
  const row = page.getByRole('row').filter({ hasText: title });
  await expect(row.getByRole('link', { name: 'View' })).toHaveAttribute('href', `/podcast/${id}`);
  await row.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Deleted 1 podcast')).toBeVisible();
  await expect(row).toHaveCount(0);
  expect(await graphql.podcast(id)).toBeNull();
});
