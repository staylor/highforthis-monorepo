import { expect, test } from '../support/test.ts';
import { field } from '../support/ui.ts';

// The media library has moved from the admin app to web (see admin/REMIX3-MIGRATION.md).

test('filters the media list by type', async ({ page }) => {
  await page.goto('/admin/media');
  // Served by web: its admin pages use the admin stylesheet its asset server builds
  await expect(page.locator('link[href*="/assets/app/styles/public/admin"]')).toHaveCount(1);
  // Choosing a type submits the filter once the select's client entry has loaded
  await page.waitForLoadState('networkidle');
  await page.getByRole('combobox', { name: 'Select Media Type' }).selectOption('image');
  await expect(page).toHaveURL(/[?&]type=image/);
  const types = page.getByRole('row').getByRole('link', { name: 'image', exact: true });
  await expect(types.first()).toBeVisible();
  await expect(page.getByRole('row').getByRole('link', { name: 'audio', exact: true })).toHaveCount(
    0
  );
});

test("edits an image's caption", async ({ page, prefix, graphql }) => {
  const image = await graphql.firstImage();
  try {
    await page.goto(`/admin/media/${image.id}`);
    await expect(page.getByRole('heading', { name: 'Edit Media' })).toBeVisible();
    await expect(page.getByText('Available crops:')).toBeVisible();
    await field(page, 'Caption').fill(`${prefix} caption`);
    await page.getByRole('button', { name: 'Update Media' }).click();
    await expect(page.getByText('Media updated.')).toBeVisible();
    expect((await graphql.image(image.id))?.caption).toBe(`${prefix} caption`);
  } finally {
    await graphql.updateImageCaption(image.id, image.caption);
  }
});

test('uploads a file and links to its edit page', async ({ page }) => {
  // GraphQL would store the file, so the upload itself is answered here
  let uploaded = '';
  await page.route(
    (url) => url.pathname === '/upload',
    async (route) => {
      uploaded = route.request().postData() ?? '';
      await route.fulfill({ json: ['e2e-upload'] });
    }
  );
  await page.goto('/admin/media/upload');
  await expect(page.getByRole('heading', { name: 'Upload Media' })).toBeVisible();
  await page.waitForLoadState('networkidle');
  await page.getByLabel('Choose Files').setInputFiles({
    name: 'e2e.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('end-to-end'),
  });
  await expect(page.getByRole('link', { name: 'Edit Media' })).toHaveAttribute(
    'href',
    '/admin/media/e2e-upload'
  );
  expect(uploaded).toContain('name="uploads"; filename="e2e.txt"');
});
