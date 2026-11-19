import { expect, type Locator, type Page } from '@playwright/test';

// Locators by what a person sees, for the places the admin's markup doesn't name things.

/**
 * A form control on the page (outside the navigation) by its visible label. The admin's forms
 * show labels as text above the control instead of <label> elements, so when no control is
 * labelled, this takes the control in the innermost block that holds the label text.
 */
export function field(page: Page, label: string): Locator {
  const main = page.getByRole('main');
  const block = main
    .locator('div')
    .filter({ has: page.getByText(label, { exact: true }) })
    .last();
  const control = block.locator('input:not([type="hidden"]), select, textarea').first();
  return main.getByLabel(label, { exact: true }).or(control).first();
}

/**
 * Searches a list: types into its search box, a GET form, presses Enter and waits for the search
 * to reach the URL. It tries again until the search takes, as when a slow CI runner hasn't
 * finished loading the page.
 */
export async function search(page: Page, placeholder: string, text: string) {
  const box = page.getByPlaceholder(placeholder);
  await expect(async () => {
    await box.clear();
    await box.fill(text);
    await box.press('Enter');
    await expect
      .poll(() => new URL(page.url()).searchParams.get('search'), { timeout: 2_000 })
      .toBe(text);
  }).toPass({ timeout: 15_000 });
}

/** The cell in a table row under the column with this header. */
export async function cell(page: Page, row: Locator, header: string): Promise<Locator> {
  const headers = await page.getByRole('table').locator('thead th').allInnerTexts();
  const index = headers.findIndex((text) => text.trim() === header);
  expect(index, `a "${header}" column`).toBeGreaterThanOrEqual(0);
  return row.locator('th, td').nth(index);
}

/**
 * The ID of the item a form just added, from its edit page's URL. Remix shows the page the add
 * redirected to before it replaces the URL, so this waits for the URL to leave the add page.
 */
export async function addedId(page: Page, section: string): Promise<string> {
  const editPage = new RegExp(`/admin/${section}/(?!add(?:[/?]|$))([^/?]+)`);
  await expect(page).toHaveURL(editPage);
  return editPage.exec(page.url())![1];
}

/** Waits for the page's client entries to hydrate; until then, their controls do nothing. */
export async function hydrated(page: Page) {
  await expect(page.locator('html[data-hydrated]')).toHaveCount(1);
}
