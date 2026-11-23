import { expect, test } from '../support/test.ts';
import { addedId, field, hydrated } from '../support/ui.ts';

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
  // Remix shows the edit page before it replaces the URL, which the reload needs
  await addedId(page, 'post');

  await page.reload();
  await expect(page.getByPlaceholder('Add a Title')).toHaveValue(title);
  await expect(page.getByRole('heading', { level: 2, name: heading })).toBeVisible();
  await expect(page.getByText(paragraph)).toBeVisible();
});

test("keeps what was written when a post can't be saved", async ({ page, prefix }) => {
  const paragraph = `Paragraph ${prefix}`;
  const summary = `Summary ${prefix}`;

  await page.goto('/admin/post/add');
  await hydrated(page);
  await page.getByText('Start writing...').click({ force: true });
  await page.keyboard.type(paragraph);
  await field(page, 'Summary').fill(summary);
  const tags = page.getByPlaceholder('Type tag then press ENTER');
  await tags.fill(`${prefix} Artist`);
  await tags.press('Enter');

  // The browser won't post a post without a title. One that gets posted anyway is turned down by
  // GraphQL, and the page comes back as it was, saying why.
  const title = page.getByPlaceholder('Add a Title');
  await expect(title).toHaveAttribute('required', '');
  await title.evaluate((element) => element.removeAttribute('required'));
  await page.getByRole('button', { name: 'Add Post' }).first().click();

  const alert = page.getByRole('alert');
  await expect(alert).toContainText("Couldn't save. Check the form and try again.");
  await expect(alert).toContainText('title');
  await expect(page.getByText(paragraph)).toBeVisible();
  await expect(field(page, 'Summary')).toHaveValue(summary);
  await expect(page.getByRole('button', { name: `Remove ${prefix} Artist` })).toBeVisible();

  // With a title, the same page saves
  await title.fill(`${prefix} Post`);
  await page.getByRole('button', { name: 'Add Post' }).first().click();
  await expect(page.getByText('Post updated.')).toBeVisible();
  await addedId(page, 'post');
  await page.reload();
  await expect(page.getByText(paragraph)).toBeVisible();
  await expect(field(page, 'Summary')).toHaveValue(summary);
});
