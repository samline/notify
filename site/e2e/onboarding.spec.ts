import { test, expect } from '@playwright/test'

test('compact Home initialization links to the actual complete starter files', async ({ page }) => {
  await page.goto('./')
  const card = page.locator('#how article').last()
  expect(await card.locator('code:visible').first().textContent()).not.toContain('<!doctype')
  await card.getByRole('link', { name: 'Copy complete working files' }).click()
  await expect(page.locator('[data-code-files]').first()).toBeVisible()
  await page
    .locator('[data-code-files]')
    .first()
    .getByRole('tab', { name: 'Complete file', exact: true })
    .click()
  await expect(
    page
      .locator('[data-code-files]')
      .first()
      .getByRole('tabpanel', { name: 'Complete file', exact: true })
  ).toContainText('<!doctype html>')
})
