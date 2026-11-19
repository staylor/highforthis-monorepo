import { expect, test } from '../support/test.ts';
import { field, hydrated } from '../support/ui.ts';

// Videos come from YouTube's import, so the test adds one through GraphQL.

test('filters videos by year, edits one and deletes it', async ({ page, prefix, graphql }) => {
  // A year no real video has, so the filter finds only this one
  const year = 1901;
  const video = await graphql.createVideo({
    title: `${prefix} Video`,
    slug: `e2e-${prefix.slice(-8)}-video`,
    year,
  });

  await page.goto('/admin/video');
  await expect(page.locator('link[href*="/assets/app/styles/public/admin"]')).toHaveCount(1);
  const row = page.getByRole('row').filter({ hasText: video.title });

  // Choosing a year submits the filter once the select's client entry has hydrated
  const filter = page.getByRole('combobox', { name: 'Select Year' });
  await hydrated(page);
  await filter.selectOption(String(year));
  await expect(page).toHaveURL(new RegExp(`[?&]year=${year}`));
  await expect(page.getByText('1 item', { exact: true }).first()).toBeVisible();
  await expect(row).toHaveCount(1);
  await expect(filter).toHaveValue(String(year));

  // A search keeps the year
  await page.getByPlaceholder('Search Videos').fill(prefix);
  await page.getByPlaceholder('Search Videos').press('Enter');
  await expect(page).toHaveURL(new RegExp(`[?&]year=${year}`));
  await expect(page).toHaveURL(/[?&]search=/);
  await expect(row).toHaveCount(1);

  await row.getByRole('link', { name: video.title }).click();
  await expect(page.getByRole('heading', { name: 'Edit Video' })).toBeVisible();
  await expect(page.getByRole('link', { name: `View ${year} Playlist` })).toBeVisible();
  await field(page, 'Title').fill(`${prefix} Video, edited`);
  await page.getByRole('button', { name: 'Update Video' }).click();
  await expect(page.getByText('Video updated.')).toBeVisible();
  expect((await graphql.video(video.id))?.title).toBe(`${prefix} Video, edited`);

  await page.goto(`/admin/video?year=${year}`);
  await row.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Deleted 1 video.')).toBeVisible();
  // The delete comes back to the same filter
  await expect(page).toHaveURL(new RegExp(`[?&]year=${year}`));
  expect(await graphql.video(video.id)).toBeNull();
});
