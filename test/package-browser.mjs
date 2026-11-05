import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { chromium } from '@playwright/test'

const source = await readFile(new URL('../dist/browser/global.global.js', import.meta.url), 'utf8')
const stylesheet = await readFile(new URL('../dist/styles.css', import.meta.url), 'utf8')
const browser = await chromium.launch({ headless: true })
try {
  for (const placement of ['body', 'head']) {
    const page = await browser.newPage()
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    const script = `<script>${source}</script>`
    await page.setContent(
      placement === 'head'
        ? `<!doctype html><head>${script}</head><body></body>`
        : `<!doctype html><body>${script}</body>`
    )
    assert.deepEqual(
      await page.evaluate(() => Object.keys(window.Notify).sort()),
      [
        'Toaster',
        'configureToaster',
        'createToaster',
        'destroyToaster',
        'getToaster',
        'toast'
      ].sort()
    )
    assert.equal(await page.evaluate(() => typeof window.Notify.toast), 'function')
    await page.waitForSelector('[data-notify-toaster]', { state: 'attached' })
    await page.evaluate(() => window.Notify.toast.success('Built artifact works'))
    await page.waitForSelector('[data-notify-toast]')
    await page.evaluate(() => window.Notify.destroyToaster())
    assert.equal(await page.locator('[data-notify-toaster]').count(), 0)
    await page.evaluate(() => {
      window.Notify.createToaster()
      window.Notify.toast.success('Remounted')
    })
    await page.waitForSelector('[data-notify-toast]')
    await page.addStyleTag({ content: stylesheet })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.evaluate(() => {
      window.Notify.destroyToaster()
      window.Notify.createToaster({ duration: Infinity, style: { '--width': '28rem' } })
      const field = document.createElement('textarea')
      field.setAttribute('aria-label', 'Native note editor')
      window.Notify.toast.custom(field)
    })
    assert.equal(
      await page.locator('[data-notify-toaster]').evaluate((node) => getComputedStyle(node).width),
      '448px'
    )
    const editor = page.getByRole('textbox', { name: 'Native note editor' })
    await editor.fill('Native editing')
    await editor.press('Backspace')
    assert.equal(await editor.inputValue(), 'Native editin')
    assert.equal(await page.locator('[data-notify-toast]:not([data-removed=true])').count(), 1)
    await page.evaluate(() => {
      window.Notify.destroyToaster()
      const controller = window.Notify.createToaster({
        duration: Infinity,
        position: 'bottom-right'
      })
      window.Notify.toast('Gesture policy follows position')
      controller.update({ position: 'top-center' })
    })
    const notification = page.locator('[data-notify-toast]:not([data-removed=true])')
    const drag = async (amount) => {
      const box = await notification.boundingBox()
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
      await page.mouse.down()
      await page.mouse.move(box.x + box.width / 2 + amount, box.y + box.height / 2, { steps: 8 })
      await page.mouse.up()
    }
    await drag(90)
    assert.equal(await notification.count(), 1)
    await page.evaluate(() => window.Notify.getToaster().update({ position: 'bottom-left' }))
    await drag(-90)
    await notification.waitFor({ state: 'detached' })
    await page.setViewportSize({ width: 320, height: 900 })
    await page.evaluate(() => {
      window.Notify.toast.info('A workspace invitation to review', {
        description:
          'Editor access includes workspace-content-administration-and-asset-management permissions.',
        duration: Infinity,
        action: { label: 'Join workspace', closeOnClick: false },
        cancel: { label: 'Not now', closeOnClick: false }
      })
    })
    const bounds = await notification.evaluate((node) => ({
      width: node.clientWidth,
      content: node.scrollWidth
    }))
    assert.ok(
      bounds.content <= bounds.width + 1,
      `Narrow action toast overflows: ${JSON.stringify(bounds)}`
    )
    const readingWidth = await notification
      .locator('[data-content]')
      .evaluate((node) => node.getBoundingClientRect().width)
    assert.ok(readingWidth >= 180, `Two-action content is squeezed into ${readingWidth}px`)
    assert.deepEqual(errors, [])
    await page.close()
  }
  console.log(
    'Chromium: classic-script global, early body, remount, width, native editing and repositioned gestures passed.'
  )
} finally {
  await browser.close()
}
