import type { Page } from '@playwright/test';

import { expect, test } from '../support/test.ts';
import { addedId, cell, field } from '../support/ui.ts';

// The artists picker, the date and the list's "attended" box are client entries, which work once
// the page's scripts have loaded.
async function openAddForm(page: Page) {
  await page.goto('/admin/show/add');
  await page.waitForLoadState('networkidle');
}

// The add form starts out like the last show added, artists included
async function removeArtists(page: Page) {
  const remove = page.getByRole('main').getByRole('button', { name: /^Remove / });
  while ((await remove.count()) > 0) {
    await remove.first().click();
  }
}

test('adds a show, edits it, marks it attended from the list and deletes it', async ({
  page,
  prefix,
  graphql,
}) => {
  const title = `${prefix} Show`;
  const editedTitle = `${title} (edited)`;

  await openAddForm(page);
  await field(page, 'Title').fill(title);
  // Any one artist and venue will do
  await removeArtists(page);
  await field(page, 'Artists').selectOption({ index: 1 });
  await field(page, 'Venue').selectOption({ index: 1 });
  await field(page, 'Attended').uncheck();
  await page.getByRole('button', { name: 'Add Show' }).click();

  await expect(page.getByRole('heading', { name: 'Edit Show' })).toBeVisible();
  await expect(page.getByText('Show updated.')).toBeVisible();
  const id = await addedId(page, 'show');
  expect((await graphql.show(id))?.title).toBe(title);

  await field(page, 'Title').fill(editedTitle);
  await field(page, 'Notes').fill('Added by the end-to-end tests');
  await page.getByRole('button', { name: 'Update Show' }).click();
  await expect(page.getByText('Show updated.')).toBeVisible();
  await page.reload();
  await expect(field(page, 'Title')).toHaveValue(editedTitle);
  await expect(field(page, 'Notes')).toHaveValue('Added by the end-to-end tests');

  await page.goto(`/admin/show?search=${encodeURIComponent(prefix)}`);
  await page.waitForLoadState('networkidle');
  const row = page.getByRole('row').filter({ hasText: editedTitle });
  const attended = (await cell(page, row, 'Attended')).getByRole('checkbox');
  await expect(attended).not.toBeChecked();
  await attended.check();
  await expect.poll(async () => (await graphql.show(id))?.attended).toBe(true);
  await page.reload();
  await page.waitForLoadState('networkidle');
  await expect(attended).toBeChecked();
  await attended.uncheck();
  await expect.poll(async () => (await graphql.show(id))?.attended).toBe(false);

  await row.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Deleted 1 show.')).toBeVisible();
  await expect(row).toHaveCount(0);
  expect(await graphql.show(id)).toBeNull();
});

test("lists an artist once, and says so when a show can't be saved", async ({ page, prefix }) => {
  await openAddForm(page);
  await field(page, 'Title').fill(`${prefix} Show`);
  await removeArtists(page);
  const artists = field(page, 'Artists');
  await artists.selectOption({ index: 1 });
  await artists.selectOption({ index: 2 });
  await artists.selectOption({ index: 1 });
  await expect(page.getByRole('main').getByRole('button', { name: /^Remove / })).toHaveCount(2);

  // A show needs an artist
  await removeArtists(page);
  await page.getByRole('button', { name: 'Add Show' }).click();
  await expect(page.getByText("Couldn't save. Check the form and try again.")).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Add Show' })).toBeVisible();
});

test('imports shows from CSV, creating their artists and venue', async ({ page, prefix }) => {
  const venue = `${prefix} Venue`;
  await page.goto('/admin/show/bulk');
  await expect(page.getByRole('heading', { name: 'Bulk Add Shows' })).toBeVisible();

  // A line without an artist comes back with the CSV kept
  const csv = page.getByLabel('Shows CSV');
  await csv.fill(`artists,venue,date\n,"${venue}",1/1/26`);
  await page.getByRole('button', { name: 'Import Shows' }).click();
  await expect(page.getByText('Line 2: At least one artist is required.')).toBeVisible();
  await expect(csv).toHaveValue(`artists,venue,date\n,"${venue}",1/1/26`);

  await csv.fill(
    `artists,venue,date,attended\n"${prefix} One; ${prefix} Two","${venue}",1/1/26,yes\n${prefix} One,"${venue}",2026-01-02,no`
  );
  await page.getByRole('button', { name: 'Import Shows' }).click();
  await expect(
    page.getByText('Imported 2 shows. Created 2 new artists and 1 new venues.')
  ).toBeVisible();

  // The cleanup removes them, by the venue's name
  await page.goto(`/admin/show?search=${encodeURIComponent(venue)}`);
  await expect(page.getByRole('row').filter({ hasText: venue })).toHaveCount(2);
});
