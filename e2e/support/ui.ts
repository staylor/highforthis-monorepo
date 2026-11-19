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

/** The cell in a table row under the column with this header. */
export async function cell(page: Page, row: Locator, header: string): Promise<Locator> {
  const headers = await page.getByRole('table').locator('thead th').allInnerTexts();
  const index = headers.findIndex((text) => text.trim() === header);
  expect(index, `a "${header}" column`).toBeGreaterThanOrEqual(0);
  return row.locator('th, td').nth(index);
}
