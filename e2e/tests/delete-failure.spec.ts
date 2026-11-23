import { expect, test } from '../support/test.ts';
import { deleteRow } from '../support/ui.ts';

test('says so when a delete fails', async ({ page, prefix, graphql }) => {
  // A venue can't be removed while a show is at it, so GraphQL refuses this delete
  const venue = await graphql.createVenue(`${prefix} Venue`);
  const artist = await graphql.firstArtist();
  await graphql.createShow({ title: `${prefix} Show`, artists: [artist.id], venue: venue.id });

  await page.goto(`/admin/venue?search=${encodeURIComponent(prefix)}`);
  const row = page.getByRole('row').filter({ hasText: venue.name });
  await deleteRow(page, row);

  await expect(
    page.getByText(
      "Couldn't delete the selected item. If your session has expired, sign in and try again."
    )
  ).toBeVisible();
  await expect(row).toBeVisible();
  expect(await graphql.venue(venue.id)).not.toBeNull();
});

test('refuses a delete once the session is gone', async ({ page, prefix, graphql }) => {
  const venue = await graphql.createVenue(`${prefix} Venue`);

  await page.goto(`/admin/venue?search=${encodeURIComponent(prefix)}`);
  const row = page.getByRole('row').filter({ hasText: venue.name });
  await expect(row).toBeVisible();
  await page.context().clearCookies();
  await deleteRow(page, row);

  await expect(page).toHaveURL('/login/unauthorized');
  expect(await graphql.venue(venue.id)).not.toBeNull();
});
