import { credentials } from '../support/env.ts';
import { expect, test } from '../support/test.ts';

// Starts signed out
test.use({ storageState: { cookies: [], origins: [] } });

test('signs in, lands on the dashboard and signs out', async ({ page }) => {
  const { email, password } = credentials();

  await page.goto('/admin');
  await expect(page).toHaveURL('/login/unauthorized');
  await expect(page.getByText('You must login to access this area.')).toBeVisible();

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Log In' }).click();
  await expect(page).toHaveURL('/admin');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  await page.getByRole('button', { name: 'Log Out' }).click();
  await expect(page).toHaveURL('/login');
  await expect(page.getByRole('button', { name: 'Log In' })).toBeVisible();

  // The session is gone, so the admin sends you back to sign in
  await page.goto('/admin');
  await expect(page).toHaveURL('/login/unauthorized');
});

test('says so when the password is wrong', async ({ page }) => {
  const { email } = credentials();
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('not-the-password');
  await page.getByRole('button', { name: 'Log In' }).click();
  await expect(page).toHaveURL('/login/failed');
  await expect(page.getByRole('alert')).toHaveText(/Couldn’t sign you in/);
});
