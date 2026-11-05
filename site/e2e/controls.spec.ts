import { expect, test } from '@playwright/test'

for (const theme of ['light', 'dark']) {
  test(`form controls remain readable and keyboard operable in ${theme}`, async ({ page }) => {
    await page.goto('examples/#position')
    for (const width of [1280, 320]) {
      await page.setViewportSize({ width, height: 900 })
      for (const zoom of [100, 200]) {
        await page.evaluate(
          ({ theme, zoom }) => {
            document.documentElement.dataset.theme = theme
            document.documentElement.style.fontSize = `${zoom}%`
          },
          { theme, zoom }
        )
        const controls = page.locator('package-site-demo[data-preset=position] select')
        const metrics = await controls.evaluateAll(nodes =>
          nodes.map(node => {
            const s = getComputedStyle(node)
            const arrow = getComputedStyle(node.parentElement!, '::after')
            const box = node.getBoundingClientRect()
            return {
              cursor: s.cursor,
              font: s.fontFamily,
              fontSize: parseFloat(s.fontSize),
              paddingEnd: parseFloat(s.paddingInlineEnd),
              readingWidth:
                node.clientWidth -
                parseFloat(s.paddingInlineStart) -
                parseFloat(s.paddingInlineEnd),
              clientWidth: node.clientWidth,
              arrowEnd: parseFloat(arrow.insetInlineEnd),
              arrowTop: parseFloat(arrow.top),
              arrowWidth: parseFloat(arrow.width),
              arrowPointerEvents: arrow.pointerEvents,
              height: box.height,
              right: box.right,
            }
          })
        )
        for (const control of metrics) {
          expect(
            control.readingWidth,
            `${width}px ${zoom}%: ${JSON.stringify(control)}`
          ).toBeGreaterThanOrEqual(control.clientWidth * 0.6)
          expect(control.cursor).toBe('pointer')
          expect(control.font).toContain('Inter')
          expect(control.fontSize).toBeGreaterThanOrEqual((16 * zoom) / 100)
          expect(control.height).toBeGreaterThanOrEqual((44 * zoom) / 100)
          expect(control.right).toBeLessThanOrEqual(width)
          expect(control.arrowEnd).toBeGreaterThanOrEqual(16)
          expect(control.paddingEnd).toBeGreaterThan(control.arrowEnd + control.arrowWidth)
          expect(Math.abs(control.arrowTop - control.height / 2)).toBeLessThan(2)
          expect(control.arrowPointerEvents).toBe('none')
        }
      }
    }
    await page.evaluate(() => (document.documentElement.style.fontSize = ''))
    const position = page.locator('package-site-demo[data-preset=position] [data-position]')
    await position.focus()
    await expect(position).toHaveCSS('outline-style', 'solid')
    await expect(position).toBeFocused()
    await page.keyboard.type('Top right')
    await page.keyboard.press('Tab')
    await expect(position).toHaveValue('top-right')
    await position.evaluate(node => {
      node.disabled = true
    })
    await expect(position).toHaveCSS('cursor', 'not-allowed')
    await expect(position.locator('..')).toHaveCSS('position', 'relative')
  })

  test(`custom editor stays reachable in a short enlarged ${theme} viewport`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 })
    await page.goto('examples/#custom')
    await page.evaluate(theme => {
      document.documentElement.dataset.theme = theme
      document.documentElement.style.fontSize = '200%'
    }, theme)
    await page.locator('package-site-demo[data-preset=custom] [data-demo-action]').click()
    const card = page.locator('.notify-receipt')
    await expect
      .poll(async () => {
        const bounds = await card.boundingBox()
        return Math.round(bounds!.y + bounds!.height)
      })
      .toBeLessThanOrEqual(720)
    const box = await card.boundingBox()
    expect(box!.y).toBeGreaterThanOrEqual(0)
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.y + box!.height).toBeLessThanOrEqual(720)
    expect(box!.x + box!.width).toBeLessThanOrEqual(320)
    await expect(card).toHaveCSS('overflow-y', 'auto')
    await expect(card).toHaveCSS('font-family', /Inter/)
    const editor = page.getByRole('textbox', { name: 'Release note', exact: true })
    await editor.fill('Readable at enlarged text')
    await editor.press('Tab')
    const save = page.getByRole('button', { name: 'Save release note', exact: true })
    await expect(save).toBeFocused()
    await save.press('Enter')
    await expect(
      page.locator('package-site-demo[data-preset=custom] [data-demo-result]')
    ).toContainText('Readable at enlarged text')
    await page.getByRole('button', { name: 'Close release receipt', exact: true }).click()
    await expect(card).toHaveCount(0)
  })
}

test('disabled actions and checkbox use appropriate cursors and preserve the brand', async ({
  page,
}) => {
  await page.goto('examples/#stream')
  const check = page.locator('[data-stack-expanded]')
  await expect(check).toHaveCSS('cursor', 'pointer')
  await expect(check).toHaveCSS('width', '18px')
  const cancel = page.locator('[data-demo-cancel]')
  await expect(cancel).toBeDisabled()
  await expect(cancel).toHaveCSS('cursor', 'not-allowed')
  const background = await cancel.evaluate(el => getComputedStyle(el).backgroundColor)
  await cancel.hover()
  await expect(cancel).toHaveCSS('background-color', background)
})
