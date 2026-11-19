import { authFile, credentials } from '../support/env.ts';
import { E2E_PREFIX, expect, test as setup } from '../support/test.ts';

setup('remove what earlier runs left behind', async ({ graphql }) => {
  await graphql.removeMatching(E2E_PREFIX);
});

setup('sign in', async ({ page }) => {
  const { email, password } = credentials();
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Log In' }).click();

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await page.context().storageState({ path: authFile });
});
