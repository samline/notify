import { test, expect, type Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { build } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { project } from '../shared/lib/project.mjs'
const presets = [
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
] as const
const exercise = async (
  page: Page,
  preset: (typeof presets)[number],
  scope = page.locator('[data-notify-demo]').first()
) => {
  const selects = scope.locator('select')
  for (const select of await selects.all()) {
    await expect(select).toHaveCSS('cursor', 'pointer')
    const spacing = await select.evaluate(node => {
      const style = getComputedStyle(node)
      const arrow = getComputedStyle(node.parentElement!, '::after')
      return { end: parseFloat(style.paddingInlineEnd), inset: parseFloat(arrow.insetInlineEnd) }
    })
    expect(spacing.inset).toBeGreaterThanOrEqual(16)
    expect(spacing.end).toBeGreaterThan(spacing.inset + 8)
  }
  const result = scope.locator('[data-demo-result]')
  await scope.locator('[data-demo-action]').click()
  if (preset === 'save') await expect(result).toContainText('Profile saved')
  if (preset === 'retry') {
    await expect(result).toContainText('Delivery failed')
    await page.getByRole('button', { name: 'Retry sending', exact: true }).click()
    await expect(result).toHaveText('October report sent')
  }
  if (preset === 'upload') await expect(result).toHaveText('Upload complete')
  if (preset === 'undo') {
    await expect(scope.locator('[data-demo-item]')).toBeHidden()
    await page.getByRole('button', { name: 'Undo archive', exact: true }).click()
    await expect(scope.locator('[data-demo-item]')).toBeVisible()
    await expect(result).toContainText('restored')
  }
  if (preset === 'persistent') {
    await expect(page.locator('[data-notify-toast]')).toBeVisible()
    await scope.locator('[data-demo-dismiss]').click()
    await expect(page.locator('[data-notify-toast]')).toHaveCount(0)
  }
  if (preset === 'custom') {
    await expect(page.locator('.notify-receipt')).toContainText('Release 4.0.0')
    const input = page.getByRole('textbox', { name: 'Release note', exact: true })
    await input.fill('Ready for the team!')
    await input.press('Backspace')
    await page.getByRole('button', { name: 'Save release note', exact: true }).click()
    await expect(result).toHaveText('Release note saved locally: Ready for the team')
    await page.getByRole('button', { name: 'Close release receipt', exact: true }).click()
    await expect(page.locator('[data-notify-toast]')).toHaveCount(0)
  }
  if (preset === 'position') {
    await scope.locator('[data-position]').selectOption('top-center')
    await scope.locator('[data-demo-action]').click()
    await expect(page.locator('[data-notify-toaster]')).toHaveAttribute('data-x-position', 'center')
  }
  if (preset === 'decisions') {
    await page.getByRole('button', { name: 'Review access', exact: true }).click()
    await expect(scope.locator('[data-review-details]')).toContainText(
      'Billing and workspace administration'
    )
    await expect(page.locator('[data-notify-toast]:not([data-removed=true])')).toHaveCount(1)
    await page.getByRole('button', { name: 'Join workspace', exact: true }).click()
    await expect(result).toHaveText('You joined Studio as an Editor')
    await scope.locator('[data-demo-reset]').click()
    await expect(page.locator('[data-notify-toast]')).toHaveCount(0)
    await scope.locator('[data-demo-action]').click()
    await page.getByRole('button', { name: 'Review access', exact: true }).click()
    await page.getByRole('button', { name: 'Not now', exact: true }).click()
    await expect(result).toHaveText('Invitation saved for later. You have not joined Studio.')
  }
  if (preset === 'stream') {
    await expect(scope.locator('[data-event-log] li')).toHaveCount(5)
    await expect(scope.locator('[data-demo-action]')).toBeEnabled()
    await expect(result).toContainText('Activity events: 5')
    await expect(
      page.locator('[data-notify-toast][data-visible=true]:not([data-removed=true])')
    ).toHaveCount(3)
    await scope.locator('[data-visible-limit]').selectOption('1')
    await expect(
      page.locator('[data-notify-toast][data-visible=true]:not([data-removed=true])')
    ).toHaveCount(1)
    await scope.locator('[data-stack-expanded]').check()
    await expect(
      page.locator('[data-notify-toast]:not([data-removed=true])').first()
    ).toHaveAttribute('data-expanded', 'true')
    await scope.locator('[data-visible-limit]').selectOption('3')
    await scope.locator('[data-stack-expanded]').uncheck()
  }
  if (preset === 'task') {
    await expect(result).toHaveText('CSV generated · 3 rows · Preview available below')
    await page.getByRole('button', { name: 'View CSV', exact: true }).click()
    await expect(scope.locator('[data-export-output]')).toBeVisible()
    await expect(scope.locator('[data-export-output]')).toContainText('October,Engineering,680')
    await scope.locator('[data-demo-reset]').click()
    await expect(page.locator('[data-notify-toast]')).toHaveCount(0)
    await scope.locator('[data-task-outcome]').selectOption('error')
    await scope.locator('[data-demo-action]').click()
    await expect(result).toHaveText('The report could not be generated')
    await expect(scope.locator('[data-demo-action]')).toBeEnabled()
    await scope.locator('[data-demo-reset]').click()
    await expect(page.locator('[data-notify-toast]')).toHaveCount(0)
    await scope.locator('[data-task-outcome]').selectOption('success')
    await scope.locator('[data-demo-action]').click()
    await scope.locator('[data-demo-cancel]').click()
    await expect(result).toHaveText('Export canceled')
    await expect(scope.locator('[data-demo-action]')).toBeEnabled()
    await expect(scope.locator('[data-export-output]')).toBeHidden()
    await expect(page.locator('[data-notify-toast]')).toHaveCount(0)
    await page.waitForTimeout(2300)
    await expect(result).toHaveText('Export canceled')
    await expect(page.locator('[data-notify-toast]')).toHaveCount(0)
  }
  if (preset === 'history') {
    await expect(result).toHaveText('Active: 1 · History: 1')
    await scope.locator('[data-demo-dismiss]').click()
    await expect(result).toHaveText('Active: 0 · History: 1')
  }
  await scope.locator('[data-demo-reset]').click()
  await expect(scope.locator('[data-demo-action]')).toBeEnabled()
}
for (const preset of presets) {
  test(`live ${preset}: task result, reset, repeated interaction`, async ({ page }) => {
    await page.goto('examples/#' + preset)
    const scope = page.locator(`package-site-demo[data-preset=${preset}]`)
    await exercise(page, preset, scope)
    await exercise(page, preset, scope)
  })
  for (const mode of ['cdn', 'esm'] as const) {
    test(`copied ${preset} ${mode}: separate and complete files execute`, async ({
      page,
      context,
    }) => {
      await page.goto('examples/#' + preset)
      const section = page.locator('section#' + preset)
      await section.getByText('Explore the code', { exact: true }).click()
      const modes = section.locator('[data-demo-modes]')
      await modes
        .getByRole('tab', { name: mode === 'cdn' ? 'HTML / CDN' : 'Package / ESM', exact: true })
        .click()
      const viewer = section.locator('[data-code-files]').filter({ visible: true })
      const files: Record<string, string> = {}
      for (const label of ['HTML', 'CSS', 'JavaScript', 'Complete file']) {
        await viewer.getByRole('tab', { name: label, exact: true }).click()
        files[label] = (await viewer
          .getByRole('tabpanel', { name: label, exact: true })
          .locator('code')
          .textContent())!
      }
      if (mode === 'esm')
        expect(files.JavaScript.indexOf('@samline/notify/styles.css')).toBeLessThan(
          files.JavaScript.indexOf('./style.css')
        )
      for (const variant of ['separate', 'complete']) {
        const example = await context.newPage()
        const errors: string[] = []
        example.on('pageerror', error => errors.push(error.message))
        let html = variant === 'complete' ? files['Complete file'] : files.HTML
        let javascript = files.JavaScript
        if (mode === 'esm') {
          if (variant === 'complete') {
            javascript = html.match(/<script type="module">([\s\S]*?)<\/script>/)![1]
            html = html.replace(
              /<script type="module">[\s\S]*?<\/script>/,
              '<script type="module" src="./main.js"></script>'
            )
          }
          const bundled = await build({
            stdin: {
              contents: javascript,
              resolveDir: fileURLToPath(new URL('../', import.meta.url)),
              loader: 'js',
            },
            bundle: true,
            write: false,
            format: 'esm',
            plugins: [
              {
                name: 'consumer-css-and-local-package',
                setup(builder) {
                  builder.onResolve({ filter: /^@samline\/notify$/ }, () => ({
                    path: fileURLToPath(new URL('../../src/index.ts', import.meta.url)),
                  }))
                  builder.onResolve({ filter: /\.css$/ }, args => ({
                    path: args.path,
                    namespace: 'styles',
                  }))
                  builder.onLoad({ filter: /.*/, namespace: 'styles' }, async args => {
                    const css =
                      args.path === './style.css'
                        ? files.CSS
                        : await readFile(new URL('../../src/styles.css', import.meta.url), 'utf8')
                    return {
                      contents: `const sheet = document.createElement('style'); sheet.textContent = ${JSON.stringify(css)}; document.head.append(sheet)`,
                      loader: 'js',
                    }
                  })
                },
              },
            ],
          })
          javascript = bundled.outputFiles[0].text
        }
        await example.route('https://example.test/**', route => {
          const url = new URL(route.request().url())
          return route.fulfill({
            body: url.pathname.endsWith('.js')
              ? javascript
              : url.pathname.endsWith('.css')
                ? files.CSS
                : html,
            contentType: url.pathname.endsWith('.js')
              ? 'text/javascript'
              : url.pathname.endsWith('.css')
                ? 'text/css'
                : 'text/html',
          })
        })
        await example.route('https://cdn.jsdelivr.net/**', async route =>
          route.fulfill({
            body: await readFile(
              new URL(
                route.request().url() === project.delivery.cdnScript
                  ? '../../dist/browser/global.global.js'
                  : '../../dist/styles.css',
                import.meta.url
              )
            ),
            contentType: route.request().url().endsWith('.css') ? 'text/css' : 'text/javascript',
          })
        )
        await example.goto('https://example.test/index.html')
        await exercise(example, preset)
        expect(errors, `${preset}/${mode}/${variant}`).toEqual([])
        await example.close()
      }
    })
  }
}
