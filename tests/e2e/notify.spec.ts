import { fileURLToPath } from 'node:url'
import { expect, test } from './fixtures'

const styles = fileURLToPath(new URL('../../dist/style.css', import.meta.url))

test('the CDN bundle exposes window.Notify without a default export and renders a toast', async ({
  load,
}) => {
  const page = await load('<main><button id="opener">Open</button></main>', 'notify')
  await page.addStyleTag({ path: styles })
  expect(await page.evaluate(() => typeof (window as any).Notify?.toast)).toBe('function')
  expect(await page.evaluate(() => 'default' in (window as any).Notify)).toBe(false)

  await page.evaluate(() => (window as any).Notify.toast.success('Saved', { id: 'saved' }))
  const toast = page.locator('[data-notify-toast][data-id="saved"]')
  await expect(toast).toHaveAttribute('data-mounted', 'true')
  await expect(toast).toHaveAttribute('data-type', 'success')
  await expect(toast.locator('[data-title]')).toHaveText('Saved')
  await expect(page.locator('[data-notify-toaster]')).toHaveAttribute('aria-live', 'polite')
  expect((await toast.boundingBox())!.height).toBeGreaterThan(0)
})

test('a dismissed toast plays its exit transition and leaves the DOM', async ({ load }) => {
  const page = await load('<main></main>', 'notify')
  await page.addStyleTag({ path: styles })
  await page.evaluate(() =>
    (window as any).Notify.toast('Bye', { id: 'bye', duration: Infinity, closeButton: true })
  )
  const toast = page.locator('[data-id="bye"]')
  await expect(toast).toHaveAttribute('data-mounted', 'true')
  await toast.locator('[data-close-button]').click()
  await expect(toast).toHaveAttribute('data-removed', 'true')
  await expect(toast).toHaveCount(0)
})

test('alt+T moves focus to the front toast and Delete dismisses it', async ({ load }) => {
  const page = await load('<main><button id="opener">Open</button></main>', 'notify')
  await page.addStyleTag({ path: styles })
  await page.evaluate(() => {
    const { toast } = (window as any).Notify
    toast('First', { id: 'first', duration: Infinity })
    toast('Second', { id: 'second', duration: Infinity })
  })
  await expect(page.locator('[data-id="second"]')).toHaveAttribute('data-front', 'true')
  await page.locator('#opener').focus()
  await page.keyboard.press('Alt+KeyT')
  await expect(page.locator('[data-id="second"]')).toBeFocused()
  await page.keyboard.press('Delete')
  await expect(page.locator('[data-id="second"]')).toHaveCount(0)
  await expect(page.locator('[data-id="first"]')).toHaveAttribute('data-front', 'true')
})

test('reduced motion removes movement, keeps a short opacity fade and still removes the toast', async ({
  load,
}) => {
  const page = await load('<main></main>', 'notify')
  await page.addStyleTag({ path: styles })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.evaluate(() =>
    (window as any).Notify.toast('Bye', { id: 'calm', duration: Infinity, closeButton: true })
  )
  const toast = page.locator('[data-id="calm"]')
  await expect(toast).toHaveAttribute('data-mounted', 'true')
  const transition = await toast.evaluate(node => {
    const style = getComputedStyle(node)
    return { property: style.transitionProperty, duration: style.transitionDuration }
  })
  expect(transition.property).toContain('opacity')
  expect(transition.property).not.toContain('transform')
  expect(transition.duration).toContain('0.15s')
  await expect(toast).toHaveCSS('opacity', '1')

  await toast.locator('[data-close-button]').click()
  await expect(toast).toHaveCount(0)
})
