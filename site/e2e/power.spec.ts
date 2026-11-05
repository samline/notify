import { test, expect } from '@playwright/test'

test('a running activity stack supports keyboard reading, expiry and manual dismissal', async ({
  page,
}) => {
  await page.goto('examples/#stream')
  const scope = page.locator('package-site-demo[data-preset=stream]')
  await scope.locator('[data-demo-action]').click()
  await expect(scope.locator('[data-event-log] li')).toHaveCount(5)
  await page.locator('body').click({ position: { x: 4, y: 4 } })
  await page.keyboard.press('Alt+KeyT')
  const front = page.locator('[data-notify-toast][data-front=true]:not([data-removed=true])')
  await expect(front).toBeFocused()
  await expect(front).toHaveAttribute('data-expanded', 'true')
  await page.keyboard.press('Delete')
  await expect(scope.locator('[data-demo-result]')).toContainText('Dismissed manually: 1')
  await scope.locator('[data-demo-action]').focus()
  await expect(scope.locator('[data-demo-result]')).toContainText('Auto-closed: 4', {
    timeout: 14000,
  })
  await expect(scope.locator('[data-event-log] li')).toHaveCount(5)
})

test('preferences apply to an existing toast including theme, direction and swipe policy', async ({
  page,
}) => {
  await page.goto('examples/#position')
  const scope = page.locator('package-site-demo[data-preset=position]')
  await scope.locator('[data-demo-action]').click()
  await scope.locator('[data-theme]').selectOption('dark')
  await scope.locator('[data-direction]').selectOption('rtl')
  await scope.locator('[data-position]').selectOption('top-center')
  const toaster = page.locator('[data-notify-toaster]')
  await expect(toaster).toHaveAttribute('data-notify-theme', 'dark')
  await expect(toaster).toHaveAttribute('dir', 'rtl')
  await expect(toaster).toHaveAttribute('data-x-position', 'center')
  await expect(page.locator('[data-notify-toast]:not([data-removed=true])')).toHaveCount(1)
  await page.getByRole('button', { name: 'Dark theme', exact: true }).click()
  await expect(toaster).toHaveAttribute('data-notify-theme', 'dark')
  await scope.locator('[data-theme]').selectOption('light')
  await expect(toaster).toHaveAttribute('data-notify-theme', 'light')
})

test('all live task controls and editable custom content fit narrow enlarged layouts', async ({
  page,
}) => {
  for (const theme of ['light', 'dark']) {
    await page.goto('examples/')
    await page.evaluate(theme => {
      document.documentElement.dataset.theme = theme
      document.documentElement.style.fontSize = '200%'
    }, theme)
    await page.setViewportSize({ width: 320, height: 900 })
    for (const preset of [
      'save',
      'retry',
      'upload',
      'undo',
      'persistent',
      'custom',
      'position',
      'history',
      'decisions',
      'stream',
      'task',
    ]) {
      const scope = page.locator(`package-site-demo[data-preset=${preset}]`)
      await scope.locator('[data-demo-action]').click()
      if (preset === 'decisions')
        await page.getByRole('button', { name: 'Review access', exact: true }).click()
      const active = page.locator('[data-notify-toast]:not([data-removed=true])')
      await expect(active.first()).toBeVisible()
      const widths = await active.evaluateAll(nodes =>
        nodes.map(node => ({ width: node.clientWidth, content: node.scrollWidth }))
      )
      for (const box of widths)
        expect(box.content, preset + theme + JSON.stringify(box)).toBeLessThanOrEqual(box.width + 1)
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),
        preset + theme
      ).toBe(false)
      await scope.locator('[data-demo-reset]').click()
      await expect(page.locator('[data-notify-toast]')).toHaveCount(0)
    }
    const custom = page.locator('package-site-demo[data-preset=custom]')
    await custom.locator('[data-demo-action]').click()
    const editor = page.getByRole('textbox', { name: 'Release note', exact: true })
    await editor.fill('Hello')
    await editor.press('Backspace')
    await expect(editor).toHaveValue('Hell')
    await expect(page.locator('.notify-receipt')).toBeVisible()
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1
    )
    expect(overflow, 'custom open ' + theme).toBe(false)
    await page.getByRole('button', { name: 'Close release receipt', exact: true }).click()
  }
})

test('an editable card preserves its draft when another preview changes shared position', async ({
  page,
}) => {
  await page.goto('examples/#custom')
  const custom = page.locator('package-site-demo[data-preset=custom]')
  await custom.locator('[data-demo-action]').click()
  await page.getByRole('textbox', { name: 'Release note', exact: true }).fill('Keep this draft')
  const preferences = page.locator('package-site-demo[data-preset=position]')
  await preferences.locator('[data-demo-action]').click()
  await preferences.locator('[data-position]').selectOption('top-center')
  await expect(page.getByRole('textbox', { name: 'Release note', exact: true })).toHaveValue(
    'Keep this draft'
  )
  await page.getByRole('button', { name: 'Save release note', exact: true }).click()
  await expect(custom.locator('[data-demo-result]')).toHaveText(
    'Release note saved locally: Keep this draft'
  )
  await page.getByRole('button', { name: 'Close release receipt', exact: true }).click()
  await custom.locator('[data-demo-action]').click()
  await expect(page.getByRole('textbox', { name: 'Release note', exact: true })).toHaveValue('')
})

test('following the page theme preserves the remaining notification lifetime', async ({ page }) => {
  await page.goto('examples/#position')
  const scope = page.locator('package-site-demo[data-preset=position]')
  await scope.locator('[data-demo-action]').click()
  const active = page.locator('[data-notify-toast]:not([data-removed=true])')
  await expect(active).toHaveCount(1)
  await page.waitForTimeout(2500)
  await expect(active).toHaveCount(1)
  await page.getByRole('button', { name: 'Dark theme', exact: true }).click()
  await expect(active).toHaveCount(0, { timeout: 2400 })
})
