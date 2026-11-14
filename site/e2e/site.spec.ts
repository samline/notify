import { test, expect } from '@playwright/test'
import { readFile, readdir } from 'node:fs/promises'
import { codeColors } from '../shared/testing/code-colors'
import { project } from '../shared/lib/project.mjs'
const articles = (
  await readdir(new URL('../docs/src/content/docs/', import.meta.url), { recursive: true })
)
  .filter(path => /\.mdx?$/.test(path))
  .map(
    path =>
      'docs/' +
      path
        .replace(/\.mdx?$/, '')
        .replace(/(^|\/)index$/, '$1')
        .replace(/\/$/, '') +
      '/'
  )
const paths = [
  ...new Set([
    '',
    'examples/',
    'docs/',
    'docs/changelog/',
    ...articles.map(path => path.replace('docs//', 'docs/')),
  ]),
]
test('all routes share readable metadata and fit both themes and enlarged mobile text', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const path of paths) {
    await page.goto(path || './')
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('meta[charset]')).toHaveCount(1)
    await expect(page.locator('meta[name=viewport]')).toHaveCount(1)
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute(
      'href',
      new URL(path, project.url).href
    )
    await expect(page.locator('meta[name=robots]')).toHaveAttribute(
      'content',
      project.template ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'
    )
    for (const width of [320, 768, 1440, 320]) {
      await page.setViewportSize({ width, height: 900 })
      for (const theme of ['light', 'dark']) {
        await page.evaluate(theme => {
          document.documentElement.dataset.theme = theme
        }, theme)
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          `${path} ${width} ${theme}`
        ).toBe(true)
      }
    }
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%'
    })
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `${path} enlarged: ${JSON.stringify(
        await page.evaluate(() =>
          [...document.querySelectorAll('body *')]
            .filter(el => {
              let p = el.parentElement
              while (p && p !== document.body) {
                if (['hidden', 'clip', 'auto', 'scroll'].includes(getComputedStyle(p).overflowX))
                  return false
                p = p.parentElement
              }
              const r = el.getBoundingClientRect()
              return r.width > 0 && (r.right > innerWidth + 1 || r.left < -1)
            })
            .slice(0, 12)
            .map(el => ({
              tag: el.tagName,
              class: el.className,
              text: el.textContent?.slice(0, 55),
              right: el.getBoundingClientRect().right,
            }))
        )
      )}`
    ).toBe(true)
  }
})
test('Home, Examples and Docs share the title font pairing and actual preview', async ({
  page,
}) => {
  for (const path of ['', 'examples/', 'docs/getting-started/']) {
    await page.goto(path || './')
    const styles = await page.locator('h1').evaluate(el => ({
      primary: getComputedStyle(el).fontFamily,
      weight: getComputedStyle(el).fontWeight,
      accent: getComputedStyle(el.querySelector('.serif')!).fontFamily,
      style: getComputedStyle(el.querySelector('.serif')!).fontStyle,
    }))
    expect(styles.primary).toContain('Inter')
    expect(styles.weight).toBe('500')
    expect(styles.accent).toContain('Instrument Serif')
    expect(styles.style).toBe('italic')
  }
  for (const path of ['', 'examples/', 'docs/guides/examples/']) {
    await page.goto(path || './')
    // Home opens on the Toast types panel; the save scenario is its second tab.
    if (!path) await page.getByRole('tab', { name: 'Save changes', exact: true }).click()
    const demo = page.locator('package-site-demo[data-preset=save]').first()
    await demo.getByRole('button', { name: 'Save changes', exact: true }).click()
    await expect(demo.locator('[data-demo-result]')).toContainText('Profile saved')
    await expect(page.locator('li[data-notify-toast][data-type="success"]')).toBeVisible()
  }
})
test('file tabs copy exact highlighted source and feedback resets independently', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  for (const path of ['examples/', 'docs/guides/examples/']) {
    await page.goto(path || './')
    await page.getByText('Explore the code', { exact: true }).first().click()
    const viewer = page.locator('[data-code-files]').filter({ visible: true }).first()
    for (const label of ['HTML', 'CSS', 'JavaScript', 'Complete file']) {
      await viewer.getByRole('tab', { name: label, exact: true }).click()
      const panel = viewer.getByRole('tabpanel', { name: label, exact: true })
      const text = await panel.locator('code').textContent()
      expect(await panel.locator('code span[style]').count()).toBeGreaterThan(2)
      const copy = panel.getByRole('button')
      await copy.click()
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(text)
      await expect(copy).toContainText('Copied!')
      await expect(copy).toContainText('Copy', { timeout: 4000 })
    }
  }
})
test('copied files and complete document actually run', async ({ page, context }) => {
  await page.goto('examples/')
  await page.getByText('Explore the code', { exact: true }).first().click()
  const viewer = page.locator('[data-code-files]').filter({ visible: true }).first()
  const files: Record<string, string> = {}
  for (const label of ['HTML', 'CSS', 'JavaScript', 'Complete file']) {
    await viewer.getByRole('tab', { name: label, exact: true }).click()
    files[label] = (await viewer
      .getByRole('tabpanel', { name: label, exact: true })
      .locator('code')
      .textContent())!
  }
  // The copied example loads the published build from the CDN. Serve the very
  // same artifacts from node_modules so the test never depends on the network.
  const assets = new Map([
    [project.delivery.cdnScript!, '../../dist/browser/global.global.js'],
    [project.delivery.cdnStylesheet!, '../../dist/styles.css'],
  ])
  for (const mode of ['separate', 'complete']) {
    // Each variant runs in its own page: the example declares top-level
    // bindings, exactly like the file a visitor would open.
    const example = await context.newPage()
    const errors: string[] = []
    example.on('pageerror', error => errors.push(error.message))
    await example.route('https://example.test/**', route => {
      const path = new URL(route.request().url()).pathname
      return route.fulfill({
        body: path.endsWith('.js')
          ? files.JavaScript
          : path.endsWith('.css')
            ? files.CSS
            : files.HTML,
        contentType: path.endsWith('.js')
          ? 'text/javascript'
          : path.endsWith('.css')
            ? 'text/css'
            : 'text/html',
      })
    })
    await example.route('https://cdn.jsdelivr.net/**', async route => {
      const url = route.request().url()
      const file = assets.get(url)
      if (!file) return route.abort()
      return route.fulfill({
        body: await readFile(new URL(file, import.meta.url), 'utf8'),
        contentType: url.endsWith('.css') ? 'text/css' : 'text/javascript',
      })
    })
    if (mode === 'separate') await example.goto('https://example.test/index.html')
    else await example.setContent(files['Complete file'])
    await example.getByRole('button', { name: 'Save changes', exact: true }).click()
    await expect(example.getByRole('button', { name: 'Save changes', exact: true })).toBeEnabled()
    await expect(example.locator('[data-demo-result]')).toContainText('Profile saved')
    await expect(example.locator('li[data-notify-toast]')).toHaveCount(1)
    await example.evaluate(() => window.Notify.toast.dismiss())
    await expect(example.locator('li[data-notify-toast]')).toHaveCount(0)
    await example.evaluate(() => {
      window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }))
      window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }))
    })
    await example.getByRole('button', { name: 'Save changes', exact: true }).click()
    await expect(example.getByRole('button', { name: 'Save changes', exact: true })).toBeEnabled()
    await expect(example.locator('[data-demo-result]')).toContainText('Profile saved')
    await expect(example.locator('li[data-notify-toast]')).toHaveCount(1)
    await example.evaluate(() => window.Notify.toast.dismiss())
    await expect(example.locator('li[data-notify-toast]')).toHaveCount(0)
    await example.evaluate(() =>
      window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: false }))
    )
    await expect(example.locator('[data-notify-toaster]')).toHaveCount(0)
    expect(errors, mode).toEqual([])
    await example.close()
  }
})
test('production Pagefind search returns meaningful links in a compact top drawer', async ({
  page,
}) => {
  await page.goto('docs/')
  await page.getByRole('button', { name: 'Search documentation', exact: true }).click()
  const input = page.getByRole('searchbox')
  await input.fill('configuration')
  await expect(page.getByRole('link', { name: /Configuration/ }).last()).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(input).not.toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Search documentation', exact: true })
  ).toBeFocused()
})
test('mobile menu closes without moving the background and keeps docs last', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./#how')
  const before = await page.evaluate(() => scrollY)
  const trigger = page.getByRole('button', { name: 'Open navigation menu' })
  await trigger.click()
  await expect(page.getByRole('dialog')).toBeVisible()
  const links = page.getByRole('navigation', { name: 'Mobile navigation' }).locator('.menu-link')
  await expect(links.last()).toHaveText(/Docs/)
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
  expect(Math.abs((await page.evaluate(() => scrollY)) - before)).toBeLessThanOrEqual(1)
})
test('no JavaScript preserves content, code, alternative installs and mobile navigation', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 900 },
  })
  const page = await context.newPage()
  await page.goto(new URL(project.base, test.info().project.use.baseURL as string).href)
  await expect(page.locator('h1')).toBeVisible()
  await expect(page.locator('code').filter({ hasText: 'pnpm add' })).toBeVisible()
  await page.locator('.menu-fallback summary').click()
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible()
  await context.close()
})
test('all pages pass automated accessibility checks in both themes', async ({ page }) => {
  test.setTimeout(120000)
  const axe = await readFile(
    new URL('../node_modules/axe-core/axe.min.js', import.meta.url),
    'utf8'
  )
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const path of paths) {
    await page.goto(path || './')
    await page.addScriptTag({ content: axe })
    for (const theme of ['dark', 'light']) {
      await page.evaluate(async theme => {
        document.documentElement.dataset.theme = theme
        await document.fonts.ready
        await Promise.all(document.getAnimations().map(a => a.finished.catch(() => {})))
      }, theme)
      const violations = await page.evaluate(async () => {
        const result = await (window as any).axe.run(document, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] },
        })
        return result.violations.map((item: any) => ({
          id: item.id,
          nodes: item.nodes.map((n: any) => n.target),
        }))
      })
      expect(violations, `${path} ${theme}`).toEqual([])
    }
  }
})

test('highlighting has the same computed palette across all three routes', async ({ page }) => {
  for (const theme of ['dark', 'light']) {
    let reference: unknown
    for (const path of ['', 'examples/', 'docs/guides/examples/']) {
      await page.goto(path || './')
      await page.evaluate(theme => {
        document.documentElement.dataset.theme = theme
      }, theme)
      if (path) await page.getByText('Explore the code', { exact: true }).first().click()
      const code = path
        ? page.locator('[data-code-files] pre[data-language=html]:visible').first()
        : page.locator('#how pre[data-language=html]:visible').first()
      const colors = await code.evaluate(codeColors)
      for (const token of Object.values(colors)) expect(token.actual).toBe(token.expected)
      if (reference) expect(colors).toEqual(reference)
      else reference = colors
    }
  }
})
test('ToC follows the clicked section and anchors retain the 2.5rem header gap', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1440, height: 500 })
  await page.goto('docs/getting-started/')
  const nav = page.locator('.desktop-toc').getByRole('navigation', { name: 'On this page' })
  const target = nav.getByRole('link', { name: 'Mount one toaster', exact: true })
  await target.click()
  await expect(target).toHaveAttribute('aria-current', 'location')
  const spacing = await page.locator('#mount-one-toaster').evaluate(el => ({
    gap:
      el.getBoundingClientRect().top -
      document.querySelector('package-site-docs-header')!.getBoundingClientRect().bottom,
    expected: parseFloat(getComputedStyle(document.documentElement).fontSize) * 2.5,
  }))
  expect(Math.abs(spacing.gap - spacing.expected)).toBeLessThan(2)
})

test('Home toast types panel sends each kind and shows its code', async ({ page }) => {
  await page.goto('./')
  const panel = page.locator('package-site-toast-types')
  await expect(panel.getByRole('button', { name: 'Success', exact: true })).toBeEnabled()
  await panel.getByRole('button', { name: 'Success', exact: true }).click()
  await expect(page.locator('li[data-notify-toast][data-type="success"]')).toBeVisible()
  await expect(panel.locator('[data-types-code]')).toContainText("toast.success('Changes saved')")
  await panel.getByLabel('Position').selectOption('top-center')
  await expect(page.locator('[data-notify-toaster]')).toHaveAttribute('data-y-position', 'top')
  await expect(panel.locator('[data-types-code]')).toContainText("position: 'top-center'")
  await panel.getByRole('button', { name: 'Action', exact: true }).click()
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await expect(page.locator('li[data-notify-toast]', { hasText: 'Message restored' })).toBeVisible()
})

test('header icon buttons stay square at 375px and the hero copy keeps its spaces', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 })
  for (const path of ['./', 'docs/']) {
    await page.goto(path)
    const buttons = page.locator('header button:visible').filter({ has: page.locator('svg') })
    expect(await buttons.count()).toBeGreaterThan(0)
    for (const button of await buttons.all()) {
      const box = (await button.boundingBox())!
      expect(Math.abs(box.width - box.height)).toBeLessThan(1)
      const icon = (await button.locator('svg').first().boundingBox())!
      expect(icon.width).toBeGreaterThan(14)
    }
  }
  await page.goto('./')
  const description = await page.locator('.hero-description').innerText()
  expect(description).not.toMatch(/\S\.[A-Z]/)
})

test('mobile menu resources and footer changelog point to the right places', async ({ page }) => {
  await page.goto('./')
  const changelog = page.locator('footer').getByRole('link', { name: 'Changelog' })
  await expect(changelog).not.toHaveAttribute('target', '_blank')
  const resources = page.locator('.menu-resources a')
  await expect(resources).toHaveCount(2)
  await expect(resources.nth(1)).toHaveAttribute('href', /npmjs\.com\/package\/@samline\/notify/)
})
