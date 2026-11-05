import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { createToaster } from '../../src/api/create-toaster'
import { destroyToaster } from '../../src/api/destroy-toaster'
import { toast } from '../../src/api/toast'
import { mountToaster } from '../../src/core/renderer'
import { ToastState, resetToastState } from '../../src/core/state'

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
})

const pointer = (node: Element, type: string, x: number, y: number) =>
  node.dispatchEvent(
    Object.assign(new Event(type, { bubbles: true }), {
      button: 0,
      pointerId: 1,
      clientX: x,
      clientY: y
    })
  )

const drag = (node: Element, dx: number, dy: number, ms = 100) => {
  pointer(node, 'pointerdown', 100, 100)
  pointer(node, 'pointermove', 100 + dx, 100 + dy)
  vi.advanceTimersByTime(ms)
  pointer(node, 'pointerup', 100 + dx, 100 + dy)
}

it('lets centered toasters swipe toward their edge', () => {
  const controller = createToaster({ position: 'bottom-center', duration: Infinity })
  toast('Centered')
  const node = controller.element.querySelector('[data-notify-toast]')!
  drag(node, 0, 80)
  expect(toast.getToasts()).toEqual([])
})

it('does not dismiss on a fast tap with a few pixels of jitter', () => {
  const controller = createToaster({ duration: Infinity })
  toast('Tap me')
  const node = controller.element.querySelector('[data-notify-toast]')!
  drag(node, 3, 0, 5)
  expect(toast.getToasts()).toHaveLength(1)
})

it('does not treat an aborted drag as a body click', () => {
  const onClick = vi.fn()
  const controller = createToaster({ duration: Infinity })
  toast('Drag', { onClick })
  const node = controller.element.querySelector('[data-notify-toast]')!
  drag(node, -20, 0, 400)
  node.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  expect(onClick).not.toHaveBeenCalled()
  vi.advanceTimersByTime(1)
  node.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  expect(onClick).toHaveBeenCalledOnce()
})

it('keeps the toast open when an action calls preventDefault()', () => {
  const controller = createToaster({ duration: Infinity })
  toast('Keep', { action: { label: 'Stay', onClick: (event) => event.preventDefault() } })
  controller.element.querySelector<HTMLButtonElement>('[data-action]')!.click()
  expect(toast.getToasts()).toHaveLength(1)
})

it('runs onDismiss once even when several toasters are mounted', () => {
  const a = mountToaster(document.body, {}, ToastState)
  const b = mountToaster(document.body, {}, ToastState)
  const onDismiss = vi.fn()
  const id = toast('Shared', { onDismiss })
  toast.dismiss(id)
  expect(onDismiss).toHaveBeenCalledOnce()
  a.destroy()
  b.destroy()
})

it('gives custom callbacks a context and releases their cleanup', () => {
  const controller = createToaster({ duration: Infinity })
  const cleanup = vi.fn()
  let dismiss: (() => void) | undefined
  const id = toast.custom((container, context) => {
    container.textContent = `custom ${String(context.id)}`
    dismiss = context.dismiss
    return cleanup
  })
  const custom = controller.element.querySelector('[data-notify-toast] > [data-custom]')
  expect(custom?.textContent).toBe(`custom ${String(id)}`)
  controller.update({ closeButton: true })
  expect(cleanup).toHaveBeenCalledTimes(1)
  dismiss?.()
  vi.advanceTimersByTime(300)
  expect(cleanup).toHaveBeenCalledTimes(2)
  expect(toast.getToasts()).toEqual([])
})

it('moves focus to the next toast, then back to the trigger, when the focused toast leaves', () => {
  const trigger = document.createElement('button')
  document.body.append(trigger)
  const controller = createToaster({ duration: Infinity })
  const first = toast('First')
  const second = toast('Second')
  trigger.focus()
  const front = controller.element.querySelector<HTMLElement>(`[data-id="${second}"]`)!
  front.dispatchEvent(new FocusEvent('focusin', { bubbles: true, relatedTarget: trigger }))
  front.focus()
  toast.dismiss(second)
  const next = controller.element.querySelector<HTMLElement>(`[data-id="${first}"]`)!
  expect(document.activeElement).toBe(next)
  toast.dismiss(first)
  expect(document.activeElement).toBe(trigger)
})

it('passes the resolved value to a description function on success', async () => {
  createToaster()
  const result = toast.promise(Promise.resolve({ name: 'report.csv' }), {
    loading: 'Exporting',
    success: 'Exported',
    description: (data) => `Saved ${(data as { name: string }).name}`
  })
  await result.unwrap()
  expect(toast.getToasts()[0]?.description).toBe('Saved report.csv')
})

it('does not treat an Error returned by a formatter as an options object', async () => {
  createToaster()
  const result = toast.promise(Promise.reject(new Error('boom')), {
    loading: 'Working',
    error: (error) => error as never
  })
  await expect(result.unwrap()).rejects.toThrow('boom')
  expect(toast.getToasts()[0]?.type).toBe('error')
})
