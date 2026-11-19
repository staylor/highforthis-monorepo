import { expect, test } from '../support/test.ts';

// Real listings come from Bowery Presents or Ticketmaster, which the tests can't reach, so this
// uses a venue whose listings page is a Ticketmaster page but not a venue's: GraphQL turns it
// down without a request, and the page says why. The controller tests cover adding listings.

test('chooses a venue and says why its listings could not be loaded', async ({
  page,
  prefix,
  graphql,
}) => {
  const listingsUrl = 'https://www.ticketmaster.com/not-a-venue-page';
  const venue = await graphql.createVenue(`${prefix} Venue`, { listingsUrl });

  await page.goto('/admin/show/listings');
  await expect(page.locator('link[href*="/assets/app/styles/public/admin"]')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Venue Listings' })).toBeVisible();

  // Choosing a venue goes to its page once the select's client entry has loaded
  const chooser = page.getByRole('combobox', { name: 'Choose a venue' });
  await page.waitForLoadState('networkidle');
  await chooser.selectOption({ label: venue.name });
  await expect(page).toHaveURL(`/admin/show/listings/${venue.id}`);
  await expect(page.getByRole('alert')).toHaveText(
    `${listingsUrl} isn't a Ticketmaster venue page (…/venue/123456).`
  );
  await expect(chooser).toHaveValue(`/admin/show/listings/${venue.id}`);
});
