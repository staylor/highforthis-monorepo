import { randomBytes } from 'node:crypto';

import { expect, test } from '../support/test.ts';
import { field } from '../support/ui.ts';

// The users section is the first to move from the admin app to web (see
// admin/REMIX3-MIGRATION.md), so these pages come from web's Remix server.

test('adds a user, edits them and deletes them from the list', async ({
  page,
  prefix,
  graphql,
}) => {
  const name = `${prefix} User`;

  await page.goto('/admin/user/add');
  // Served by web: its admin pages use the admin stylesheet its asset server builds
  await expect(page.locator('link[href*="/assets/app/styles/public/admin"]')).toHaveCount(1);
  await field(page, 'Name').fill(name);
  await field(page, 'Email').fill(`e2e-${prefix.slice(-8)}@example.com`);
  await field(page, 'Password').fill(randomBytes(12).toString('hex'));
  await field(page, 'Roles').selectOption(['editor']);
  await page.getByRole('button', { name: 'Add User' }).click();

  await expect(page.getByRole('heading', { name: 'Edit User' })).toBeVisible();
  await expect(page.getByText('User updated.')).toBeVisible();
  const id = new URL(page.url()).pathname.split('/').pop() as string;
  expect((await graphql.user(id))?.name).toBe(name);

  await field(page, 'Bio').fill('Added by the end-to-end tests');
  await page.getByRole('button', { name: 'Update User' }).click();
  // The message is already showing from the add, so wait for the save itself
  await expect
    .poll(async () => (await graphql.user(id))?.bio)
    .toBe('Added by the end-to-end tests');
  await page.reload();
  await expect(field(page, 'Bio')).toHaveValue('Added by the end-to-end tests');
  await expect(field(page, 'Name')).toHaveValue(name);

  await page.goto(`/admin/user?search=${encodeURIComponent(prefix)}`);
  const row = page.getByRole('row').filter({ hasText: name });
  await row.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Deleted 1 user.')).toBeVisible();
  await expect(row).toHaveCount(0);
  expect(await graphql.user(id)).toBeNull();
});
