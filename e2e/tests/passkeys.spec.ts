import { expect, test } from '../support/test.ts';
import { hydrated } from '../support/ui.ts';

// Chromium's virtual authenticator stands in for Touch ID or a security key: it answers the
// browser's WebAuthn prompts as soon as they open.
test('adds a passkey, signs in with it and removes it', async ({ page, prefix, graphql }) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('WebAuthn.enable');
  await cdp.send('WebAuthn.addVirtualAuthenticator', {
    options: {
      protocol: 'ctap2',
      transport: 'internal',
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      automaticPresenceSimulation: true,
    },
  });

  const name = `${prefix} Passkey`;
  await page.goto('/admin/passkeys');
  await expect(page.getByRole('heading', { name: 'Passkeys', level: 1 })).toBeVisible();
  // A name typed before the page hydrates stays in the field, but the button needs it hydrated
  await page.getByLabel('Passkey name').fill(name);
  const row = page.getByRole('listitem').filter({ hasText: name });
  await hydrated(page);
  await page.getByRole('button', { name: 'Add passkey' }).click();
  await expect(row.getByText('Not used yet')).toBeVisible();
  expect((await graphql.passkeys()).some((passkey) => passkey.name === name)).toBe(true);

  // Signing out keeps the authenticator, so the passkey can sign back in
  await page.getByRole('link', { name: 'Log Out' }).click();
  await expect(page).toHaveURL('/login');
  await hydrated(page);
  await page.getByRole('button', { name: 'Sign in with a passkey' }).click();
  await expect(page).toHaveURL('/admin');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  await page.goto('/admin/passkeys');
  await expect(row.getByText(/^Last used /)).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await row.getByRole('button', { name: 'Remove' }).click();
  await expect(row).toBeHidden();
  expect((await graphql.passkeys()).some((passkey) => passkey.name === name)).toBe(false);
});
