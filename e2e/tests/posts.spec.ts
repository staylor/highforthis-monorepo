import { expect, test } from '../support/test.ts';
import { hydrated } from '../support/ui.ts';

test('creates a post with a heading, which is still there after a reload', async ({
  page,
  prefix,
}) => {
  const title = `${prefix} Post`;
  const heading = `Heading ${prefix}`;
  const paragraph = `Paragraph ${prefix}`;

  // The editor is a client entry, which works once it has hydrated
  await page.goto('/admin/post/add');
  await hydrated(page);
  await page.getByPlaceholder('Add a Title').fill(title);

  // Clicking the placeholder lands in the editor underneath, which starts with an empty line
  await page.getByText('Start writing...').click({ force: true });
  await page.getByRole('button', { name: 'Block types' }).click();
  await page.getByRole('button', { name: 'H2', exact: true }).click();
  await page.keyboard.type(heading);
  await page.keyboard.press('Enter');
  await page.keyboard.type(paragraph);
  await expect(page.getByRole('heading', { level: 2, name: heading })).toBeVisible();

  await page.getByRole('button', { name: 'Add Post' }).click();
  await expect(page.getByText('Post updated.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Edit Post' })).toBeVisible();

  await page.reload();
  await expect(page.getByPlaceholder('Add a Title')).toHaveValue(title);
  await expect(page.getByRole('heading', { level: 2, name: heading })).toBeVisible();
  await expect(page.getByText(paragraph)).toBeVisible();
});
