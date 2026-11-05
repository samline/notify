import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { createToaster } from '../../src/api/create-toaster'
import { destroyToaster } from '../../src/api/destroy-toaster'
import { toast } from '../../src/api/toast'
import { resetToastState } from '../../src/core/state'

beforeEach(() => {
  destroyToaster()
  resetToastState()
  document.body.innerHTML = ''
  vi.useFakeTimers()
})
afterEach(() => {
  destroyToaster()
  resetToastState()
  vi.useRealTimers()
  vi.restoreAllMocks()
})
const swipe = (node: Element, amount: number) => {
  for (const [type, x] of [
    ['pointerdown', 100],
    ['pointermove', 100 + amount],
    ['pointerup', 100 + amount]
  ] as const) {
    node.dispatchEvent(
      Object.assign(new Event(type, { bubbles: true }), {
        button: 0,
        pointerId: 1,
        clientX: x,
        clientY: 100
      })
    )
    vi.advanceTimersByTime(100)
  }
}
it('applies consumer width and palette with option-owned stack geometry', () => {
  const controller = createToaster({
    gap: 16,
    style: { '--width': '28rem', '--normal-bg': '#123456' }
  })
  expect(controller.element.style.getPropertyValue('--width')).toBe('28rem')
  expect(controller.element.style.getPropertyValue('--gap')).toBe('16px')
  expect(controller.element.style.getPropertyValue('--normal-bg')).toBe('#123456')
  controller.update({ style: { '--width': '24rem' } })
  expect(controller.element.style.getPropertyValue('--width')).toBe('24rem')
})
it('updates swipe eligibility and direction on existing notifications after repositioning', () => {
  const controller = createToaster({ position: 'bottom-right', duration: Infinity })
  const id = toast('Keep this')
  controller.update({ position: 'top-center' })
  swipe(controller.element.querySelector('[data-notify-toast]')!, 100)
  expect(toast.getToasts().map((t) => t.id)).toContain(id)
  controller.update({ position: 'bottom-left' })
  swipe(controller.element.querySelector('[data-notify-toast]')!, -100)
  expect(toast.getToasts()).toEqual([])
})
it('keeps Delete and Backspace available to editable content inside custom notifications', () => {
  const controller = createToaster()
  const input = document.createElement('textarea')
  const id = toast.custom(input, { duration: Infinity })
  input.focus()
  input.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true })
  )
  expect(toast.getToasts().map((t) => t.id)).toContain(id)
  const node = controller.element.querySelector<HTMLElement>('[data-notify-toast]')!
  node.focus()
  node.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }))
  expect(toast.getToasts()).toEqual([])
})
it('does not begin swipe capture from fields or nested button content', () => {
  createToaster({ duration: Infinity })
  const input = document.createElement('input')
  const id = toast.custom(input)
  swipe(input, 100)
  expect(toast.getToasts().map((t) => t.id)).toContain(id)
})
it('applies an updated duration while the document is hidden', () => {
  let hidden = true
  vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden)
  const controller = createToaster({ duration: 1000 })
  const id = toast('A')
  controller.update({ duration: 5000 })
  hidden = false
  document.dispatchEvent(new Event('visibilitychange'))
  vi.advanceTimersByTime(1500)
  expect(toast.getToasts().map((t) => t.id)).toContain(id)
  vi.advanceTimersByTime(3500)
  expect(toast.getToasts()).toEqual([])
})
it('preserves remaining duration when content changes in a hidden tab', () => {
  let hidden = false
  vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden)
  createToaster({ duration: 5000 })
  const id = toast('A')
  vi.advanceTimersByTime(2000)
  hidden = true
  document.dispatchEvent(new Event('visibilitychange'))
  toast('Updated', { id })
  hidden = false
  document.dispatchEvent(new Event('visibilitychange'))
  vi.advanceTimersByTime(3000)
  expect(toast.getToasts()).toEqual([])
})

it('expands the stack for keyboard readers and collapses when focus leaves', () => {
  const controller = createToaster({ duration: Infinity })
  toast('First')
  toast('Second')
  const node = controller.element.querySelector<HTMLElement>('[data-front="true"]')!
  node.focus()
  expect(node.dataset['expanded']).toBe('true')
  const outside = document.createElement('button')
  document.body.append(outside)
  outside.focus()
  expect(node.dataset['expanded']).toBe('false')
})
it('clears swipe transforms on pointer cancellation and rejects the wrong direction', () => {
  const controller = createToaster({ duration: Infinity, position: 'bottom-right' })
  const id = toast('Message')
  const node = controller.element.querySelector<HTMLElement>('[data-notify-toast]')!
  node.dispatchEvent(
    Object.assign(new Event('pointerdown'), { button: 0, pointerId: 1, clientX: 100, clientY: 100 })
  )
  node.dispatchEvent(Object.assign(new Event('pointermove'), { clientX: 150, clientY: 100 }))
  node.dispatchEvent(new Event('pointercancel'))
  expect(node.style.getPropertyValue('--swipe-amount-x')).toBe('0px')
  expect(node.dataset['swiped']).toBe('false')
  swipe(node, -300)
  expect(toast.getToasts().map((t) => t.id)).toContain(id)
})

it('releases stack interaction state after a canceled pointer gesture', () => {
  const controller = createToaster({ duration: Infinity })
  toast('First')
  toast('Second')
  const node = controller.element.querySelector<HTMLElement>('[data-front="true"]')!
  controller.element.dispatchEvent(new MouseEvent('mouseenter'))
  node.dispatchEvent(
    Object.assign(new Event('pointerdown', { bubbles: true }), {
      button: 0,
      pointerId: 1,
      clientX: 100,
      clientY: 100
    })
  )
  node.dispatchEvent(new Event('pointercancel', { bubbles: true }))
  controller.element.dispatchEvent(new MouseEvent('mouseleave'))
  expect(node.dataset['expanded']).toBe('false')
})
