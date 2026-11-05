import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { build } from 'esbuild'
const migration = JSON.parse(
  await readFile(new URL('../brief/documentation-migration.json', import.meta.url), 'utf8')
)
test('historical public fragments survive page redirects and query strings', async ({ page }) => {
  const cases = [
    ['reference/examples/', 'typed-low-level-event-narrowing', 'guides/examples/'],
    ['reference/browser/', 'standalone-iife', 'reference/browser/'],
    ['getting-started/', 'no-bundler', 'getting-started/'],
    ['reference/', 'core-reference', 'reference/api/'],
  ]
  for (const [old, fragment, destination] of cases) {
    await page.goto(old + '?from=bookmark#' + fragment)
    await expect(page).toHaveURL(new RegExp(`docs/${destination}\\?from=bookmark#${fragment}$`))
    await expect(page.locator('[id="' + fragment + '"]')).toHaveCount(1)
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  }
  expect(migration.unresolved).toEqual([])
})
test('CMS integration owns multiple scopes and survives section replacement and unload', async ({
  page,
}) => {
  const built = await build({
    entryPoints: [new URL('../../src/browser/global.ts', import.meta.url).pathname],
    bundle: true,
    format: 'iife',
    write: false,
  })
  const hosts = await readFile(
    new URL('../shared/examples/frameworks/notify-hosts.js', import.meta.url),
    'utf8'
  )
  const scope = (id: string) =>
    `<section id="${id}" data-notify-host><button type="button" data-notify-save>Save changes</button></section>`
  await page.setContent(scope('first') + scope('second'))
  await page.addScriptTag({ content: built.outputFiles[0].text })
  await page.addScriptTag({ content: hosts })
  await page.addScriptTag({ content: hosts }) // repeated layout asset evaluation is harmless
  await page.locator('#first button').click()
  await expect(page.locator('[data-notify-toast]')).toHaveCount(1)
  await page.evaluate(() =>
    document
      .querySelector('#first')!
      .dispatchEvent(new CustomEvent('shopify:section:unload', { bubbles: true }))
  )
  await page.locator('#first button').click()
  await expect(page.locator('[data-notify-toast]')).toHaveCount(1)
  await page.locator('#second button').click()
  await expect(page.locator('[data-notify-toast]')).toHaveCount(2)
  await page.evaluate(() => {
    document.querySelector('#first')!.remove()
    document.querySelector('#second')!.remove()
  })
  await expect(page.locator('[data-notify-toaster]')).toHaveCount(0)
  await page.evaluate(
    html => document.body.insertAdjacentHTML('beforeend', html),
    scope('replacement')
  )
  await expect(page.locator('[data-notify-toaster]')).toHaveCount(1)
  await page.locator('#replacement button').click()
  await expect(page.locator('[data-notify-toast]')).toHaveCount(1)
  await page.evaluate(() =>
    window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: false }))
  )
  await expect(page.locator('[data-notify-toaster]')).toHaveCount(0)
})
