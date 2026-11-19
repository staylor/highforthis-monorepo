import { expect, test } from '../support/test.ts';
import { hydrated } from '../support/ui.ts';

test('picks featured media for a post, scrolling the picker to load more', async ({
  page,
  prefix,
  graphql,
}) => {
  const post = await graphql.createPost({ title: `${prefix} Post` });
  await page.goto(`/admin/post/${post.id}`);

  // The picker opens once its client entry has hydrated
  const picker = page.getByRole('dialog', { name: 'Media' });
  await hydrated(page);
  await page.getByRole('button', { name: 'Set Featured Media' }).click();
  await expect(picker).toBeVisible();
  // The uploads, and the close button
  const buttons = picker.getByRole('button');
  await expect.poll(() => buttons.count()).toBeGreaterThan(1);
  const firstPage = await buttons.count();

  // Scrolling to the bottom loads the next page
  await expect(async () => {
    await buttons.last().hover();
    await page.mouse.wheel(0, 10_000);
    expect(await buttons.count()).toBeGreaterThan(firstPage);
  }).toPass();

  // Pick the first upload on the page that just loaded. The picker can load another page before
  // the click, so the button is picked by position rather than as the last one.
  const upload = buttons.nth(firstPage);
  const thumbnail = await upload.locator('img').getAttribute('src');
  await upload.click();
  await expect(picker).toBeHidden();

  await page.getByRole('button', { name: 'Update Post' }).click();
  await expect(page.getByText('Post updated.')).toBeVisible();
  const [featured] = (await graphql.post(post.id))?.featuredMedia ?? [];
  expect(featured, 'the post has featured media').toBeDefined();
  const crop = featured.crops.find(({ width }) => width === 150);
  expect(thumbnail).toContain(`/${featured.destination}/${crop?.fileName}`);
});
