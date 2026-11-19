import { expect, test } from '../support/test.ts';
import { addedId, field, hydrated } from '../support/ui.ts';

test('adds a venue with its details, closes it from the list and deletes it', async ({
  page,
  prefix,
  graphql,
}) => {
  const name = `${prefix} Venue`;

  await page.goto('/admin/venue/add');
  await expect(page.locator('link[href*="/assets/app/styles/public/admin"]')).toHaveCount(1);
  await field(page, 'Name').fill(name);
  await field(page, 'Capacity').fill('2362');
  await field(page, 'City').fill('Nashville');
  await page.getByRole('textbox', { name: 'Latitude' }).fill('36.1612');
  await page.getByRole('textbox', { name: 'Longitude' }).fill('-86.7785');

  // The picker opens once its client entry has loaded
  const picker = page.getByRole('dialog', { name: 'Media' });
  await expect(async () => {
    await page.getByRole('button', { name: 'Set Featured Media' }).click();
    await expect(picker).toBeVisible({ timeout: 1_000 });
  }).toPass();
  // The uploads, and the close button
  const uploads = picker.getByRole('button');
  await expect.poll(() => uploads.count()).toBeGreaterThan(1);
  await uploads.nth(1).click();
  await expect(picker).toBeHidden();
  const picked = await page.locator('input[type="hidden"][name="featuredMedia"]').inputValue();

  await page.getByRole('button', { name: 'Add Venue' }).click();
  await expect(page.getByRole('heading', { name: 'Edit Venue' })).toBeVisible();
  await expect(page.getByText('Venue updated.')).toBeVisible();
  const id = await addedId(page, 'venue');
  const added = await graphql.venue(id);
  expect(added).toMatchObject({
    name,
    capacity: '2362',
    coordinates: { latitude: 36.1612, longitude: -86.7785 },
  });
  expect(added?.featuredMedia?.map((media) => media.id)).toEqual([picked]);
  await expect(page.getByRole('textbox', { name: 'Latitude' })).toHaveValue('36.1612');

  await field(page, 'Exclude from search').check();
  await page.getByRole('button', { name: 'Edit Venue' }).click();
  // The message is already showing from the add, so wait for the save itself
  await expect.poll(async () => (await graphql.venue(id))?.excludeFromSearch).toBe(true);

  await page.goto(`/admin/venue?search=${encodeURIComponent(prefix)}`);
  const row = page.getByRole('row').filter({ hasText: name });
  const closed = row.getByRole('checkbox', { name: `Permanently Closed: ${name}` });
  await expect(closed).not.toBeChecked();
  // A click before the box's client entry hydrates doesn't save
  await hydrated(page);
  await closed.check();
  await expect.poll(async () => (await graphql.venue(id))?.permanentlyClosed).toBe(true);
  await page.reload();
  await expect(closed).toBeChecked();
  // The other box saved on the edit page
  await expect(row.getByRole('checkbox', { name: `Exclude from search: ${name}` })).toBeChecked();

  await row.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Deleted 1 venue.')).toBeVisible();
  await expect(row).toHaveCount(0);
  expect(await graphql.venue(id)).toBeNull();
});
