import { expect, test } from '../support/test.ts';

test('searches a list and pages through the results', async ({ page, prefix, graphql }) => {
  // 25 posts make two pages of 20. Newest first, so "Post 25" leads and "Post 05" starts page two.
  // Drafts, which the list marks as such, stay off the public site.
  const start = Date.UTC(2020, 0, 1);
  for (let i = 1; i <= 25; i += 1) {
    const number = String(i).padStart(2, '0');
    await graphql.createPost({ title: `${prefix} Post ${number}`, date: start + i * 60_000 });
  }
  const titles = page.getByRole('link', { name: prefix });

  await page.goto('/admin/post');
  await page.getByPlaceholder('Search Posts').fill(prefix);
  await expect(page).toHaveURL(/[?&]search=/);
  await expect(page.getByText('25 items').first()).toBeVisible();
  await expect(page.getByText('1 of 2').first()).toBeVisible();
  await expect(titles).toHaveCount(20);
  await expect(titles.first()).toContainText(`${prefix} Post 25`);

  await page.getByRole('link', { name: '›' }).first().click();
  await expect(page).toHaveURL(/[?&]page=2/);
  await expect(page.getByText('2 of 2').first()).toBeVisible();
  await expect(titles).toHaveCount(5);
  await expect(titles.first()).toContainText(`${prefix} Post 05`);
  await expect(titles.last()).toContainText(`${prefix} Post 01`);

  await page.getByRole('link', { name: '‹' }).first().click();
  await expect(page.getByText('1 of 2').first()).toBeVisible();
  await expect(titles).toHaveCount(20);

  // The search narrows the list down
  await page.getByPlaceholder('Search Posts').fill(`${prefix} Post 07`);
  await expect(page.getByText('1 item', { exact: true }).first()).toBeVisible();
  await expect(titles).toContainText([`${prefix} Post 07`]);
});
