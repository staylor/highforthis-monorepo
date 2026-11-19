import { expect, test } from '../support/test.ts';
import { field, hydrated } from '../support/ui.ts';

// Settings are shared by the whole site, so each test puts back what it changes.

test('saves the general settings, from /settings', async ({ page, prefix, graphql }) => {
  const before = await graphql.siteSettings();
  try {
    await page.goto('/admin/settings');
    await expect(page.locator('link[href*="/assets/app/styles/public/admin"]')).toHaveCount(1);
    await expect(page.getByRole('heading', { name: 'General Settings' })).toBeVisible();
    await expect(field(page, 'Site Title')).toHaveValue(before.siteTitle ?? '');

    await field(page, 'Tagline').fill(`${prefix} tagline`);
    await page.getByRole('button', { name: 'Update Settings' }).click();
    await expect(page.getByText('Settings Updated.')).toBeVisible();
    expect((await graphql.siteSettings()).tagline).toBe(`${prefix} tagline`);
  } finally {
    await graphql.updateSiteSettings({ tagline: before.tagline });
  }
});

test('adds a crop size and removes it again', async ({ page, prefix, graphql }) => {
  const before = await graphql.mediaCrops();
  const name = `e2e-${prefix.slice(-8)}`;
  try {
    await page.goto('/admin/settings/media');
    await expect(page.getByRole('heading', { name: 'Media Settings' })).toBeVisible();
    const names = page.getByRole('textbox', { name: /^Name \d+$/ });
    await expect(names).toHaveCount(Math.max(before.length, 1));

    // Adding a row needs the editor's client entry
    const rows = await names.count();
    await expect(async () => {
      await page.getByRole('button', { name: 'Add Crop' }).click();
      await expect(names).toHaveCount(rows + 1, { timeout: 1_000 });
    }).toPass();
    const row = rows + 1;
    await page.getByRole('textbox', { name: `Name ${row}` }).fill(name);
    await page.getByRole('spinbutton', { name: `Width ${row}` }).fill('640');
    await page.getByRole('spinbutton', { name: `Height ${row}` }).fill('360');
    await page.getByRole('button', { name: 'Update Settings' }).click();
    await expect(page.getByText('Settings Updated.')).toBeVisible();
    expect(await graphql.mediaCrops()).toContainEqual({ name, width: 640, height: 360 });

    // After a reload the saved row is the last one; removing it and saving takes it out
    await page.reload();
    await hydrated(page);
    await expect(page.getByRole('textbox', { name: `Name ${row}` })).toHaveValue(name);
    await page
      .getByRole('row')
      .filter({ has: page.getByRole('textbox', { name: `Name ${row}` }) })
      .getByRole('button', { name: 'Remove' })
      .click();
    await expect(names).toHaveCount(rows);
    await page.getByRole('button', { name: 'Update Settings' }).click();
    await expect
      .poll(async () => (await graphql.mediaCrops()).map((crop) => crop.name))
      .not.toContain(name);
  } finally {
    await graphql.updateMediaCrops(before);
  }
});
