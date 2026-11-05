import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'

test('open notification flows remain accessible in both themes', async ({ page }) => {
  test.setTimeout(120000)
  const axe = await readFile(
    new URL('../node_modules/axe-core/axe.min.js', import.meta.url),
    'utf8'
  )
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const theme of ['light', 'dark']) {
    for (const preset of ['custom', 'decisions', 'stream', 'task']) {
      await page.goto('examples/#' + preset)
      // Hash navigation keeps the previous DOM and its persistent custom card.
      // Audit each flow from a fresh owner; cross-preview continuity has its own test.
      await page.reload()
      if ((await page.locator('html').getAttribute('data-theme')) !== theme) {
        await page.getByRole('button', { name: 'Dark theme', exact: true }).click()
      }
      const scope = page.locator(`package-site-demo[data-preset=${preset}]`)
      if (preset === 'stream') {
        await scope.locator('[data-visible-limit]').selectOption('5')
        await scope.locator('[data-stack-expanded]').check()
      }
      await scope.locator('[data-demo-action]').click()
      if (preset === 'decisions')
        await page.getByRole('button', { name: 'Review access', exact: true }).click()
      if (preset === 'stream') await expect(scope.locator('[data-event-log] li')).toHaveCount(5)
      if (preset === 'task')
        await expect(scope.locator('[data-demo-result]')).toContainText('CSV generated')
      await page.addScriptTag({ content: axe })
      await page.evaluate(() => document.fonts.ready)
      const violations = await page.evaluate(async () => {
        const result = await (window as any).axe.run('[data-notify-toaster]', {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] },
        })
        return result.violations.map((item: any) => ({
          id: item.id,
          nodes: item.nodes.map((node: any) => ({
            target: node.target,
            reason: node.failureSummary,
          })),
        }))
      })
      expect(violations, `${preset} ${theme}`).toEqual([])
    }
  }
})
