import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { mountToaster } from '../../src/core/renderer'
import { ToastState, resetToastState } from '../../src/core/state'
import { TIME_BEFORE_UNMOUNT, VIEWPORT_OFFSET, MOBILE_VIEWPORT_OFFSET } from '../../src/core/constants'
import { toast } from '../../src/api/toast'
import type { ToasterController } from '../../src/core/types'

describe('core/renderer', () => {
  let root: HTMLDivElement
  let controller: ToasterController

  beforeEach(() => {
    resetToastState()
    document.body.innerHTML = ''
    root = document.createElement('div')
    document.body.appendChild(root)
  })

  afterEach(() => {
    controller?.destroy()
    resetToastState()
    document.body.innerHTML = ''
  })

  it('creates an <ol data-notify-toaster> with default attributes', () => {
    controller = mountToaster(root, {}, ToastState)
    const toaster = root.querySelector('ol[data-notify-toaster]')
    expect(toaster).toBeTruthy()
    expect(toaster?.getAttribute('data-y-position')).toBe('bottom')
    expect(toaster?.getAttribute('data-x-position')).toBe('right')
    expect(toaster?.getAttribute('data-notify-theme')).toBe('light')
    expect(toaster?.getAttribute('data-lifted')).toBe('true')
  })

  it('honors position + theme options', () => {
    controller = mountToaster(root, { position: 'top-left', theme: 'dark' }, ToastState)
    const toaster = root.querySelector('ol[data-notify-toaster]')
    expect(toaster?.getAttribute('data-y-position')).toBe('top')
    expect(toaster?.getAttribute('data-x-position')).toBe('left')
    expect(toaster?.getAttribute('data-notify-theme')).toBe('dark')
  })

  it('applies numeric offsets as CSS variables', () => {
    controller = mountToaster(root, { offset: 32, mobileOffset: 8 }, ToastState)
    const toaster = root.querySelector('ol[data-notify-toaster]') as HTMLElement
    expect(toaster.style.getPropertyValue('--offset-top')).toBe('32px')
    expect(toaster.style.getPropertyValue('--offset-right')).toBe('32px')
    expect(toaster.style.getPropertyValue('--offset-bottom')).toBe('32px')
    expect(toaster.style.getPropertyValue('--offset-left')).toBe('32px')
    expect(toaster.style.getPropertyValue('--mobile-offset-top')).toBe('8px')
  })

  it('applies string offsets as CSS variables', () => {
    controller = mountToaster(root, { offset: '12px' }, ToastState)
    const toaster = root.querySelector('ol[data-notify-toaster]') as HTMLElement
    expect(toaster.style.getPropertyValue('--offset-top')).toBe('12px')
  })

  it('applies per-side offsets as CSS variables', () => {
    controller = mountToaster(
      root,
      { offset: { top: 10, right: '2rem', bottom: 5, left: 0 } },
      ToastState
    )
    const toaster = root.querySelector('ol[data-notify-toaster]') as HTMLElement
    expect(toaster.style.getPropertyValue('--offset-top')).toBe('10px')
    expect(toaster.style.getPropertyValue('--offset-right')).toBe('2rem')
    expect(toaster.style.getPropertyValue('--offset-bottom')).toBe('5px')
    expect(toaster.style.getPropertyValue('--offset-left')).toBe('0px')
  })

  it('falls back to default offset values when none are provided', () => {
    controller = mountToaster(root, {}, ToastState)
    const toaster = root.querySelector('ol[data-notify-toaster]') as HTMLElement
    expect(toaster.style.getPropertyValue('--offset-top')).toBe(VIEWPORT_OFFSET)
    expect(toaster.style.getPropertyValue('--mobile-offset-top')).toBe(MOBILE_VIEWPORT_OFFSET)
  })

  it('renders a <li data-notify-toast> after toast()', () => {
    controller = mountToaster(root, {}, ToastState)
    const id = ToastState.create({ message: 'hello' })
    const li = root.querySelector(`li[data-notify-toast][data-id="${id}"]`)
    expect(li).toBeTruthy()
    expect(li?.getAttribute('data-type')).toBe('normal')
    expect(li?.getAttribute('data-styled')).toBe('true')
    expect(li?.getAttribute('data-mounted')).toBe('true')
    expect(li?.textContent).toContain('hello')
  })

  it('applies data-type=success for success variant', () => {
    controller = mountToaster(root, {}, ToastState)
    const id = ToastState.success('Saved!')
    const li = root.querySelector(`li[data-notify-toast][data-id="${id}"]`)
    expect(li?.getAttribute('data-type')).toBe('success')
  })

  it('applies data-rich-colors=true to the toaster and toasts', () => {
    controller = mountToaster(root, { richColors: true }, ToastState)
    const id = ToastState.success('Saved!')
    const toaster = root.querySelector('ol[data-notify-toaster]')
    expect(toaster?.getAttribute('data-rich-colors')).toBe('true')
    const li = root.querySelector(`li[data-notify-toast][data-id="${id}"]`)
    expect(li?.getAttribute('data-rich-colors')).toBe('true')
  })

  it('removes the <li> after dismiss() + TIME_BEFORE_UNMOUNT', () => {
    controller = mountToaster(root, {}, ToastState)
    const id = ToastState.create({ message: 'bye' })
    const before = root.querySelector(`li[data-notify-toast][data-id="${id}"]`)
    expect(before).toBeTruthy()

    ToastState.dismiss(id)
    // data-removed goes true immediately
    expect(before?.getAttribute('data-removed')).toBe('true')
    // after TIME_BEFORE_UNMOUNT, node is removed
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const after = root.querySelector(`li[data-notify-toast][data-id="${id}"]`)
        expect(after).toBeNull()
        resolve()
      }, TIME_BEFORE_UNMOUNT + 50)
    })
  })

  it('respects visibleToasts option (stacking)', () => {
    controller = mountToaster(root, { visibleToasts: 1, expand: false }, ToastState)
    const a = ToastState.create({ message: 'a' })
    const b = ToastState.create({ message: 'b' })
    const c = ToastState.create({ message: 'c' })

    const visibleCount = Array.from(
      root.querySelectorAll<HTMLLIElement>('li[data-notify-toast][data-visible="true"]')
    ).length
    expect(visibleCount).toBe(1)

    expect(root.querySelector(`li[data-id="${a}"]`)).toBeTruthy()
    expect(root.querySelector(`li[data-id="${b}"]`)).toBeTruthy()
    expect(root.querySelector(`li[data-id="${c}"]`)).toBeTruthy()
  })

  it('destroy() removes the toaster from the DOM', () => {
    controller = mountToaster(root, {}, ToastState)
    expect(root.querySelector('ol[data-notify-toaster]')).toBeTruthy()

    controller.destroy()
    expect(root.querySelector('ol[data-notify-toaster]')).toBeNull()
  })

  it('close button calls dismiss when clicked', () => {
    controller = mountToaster(root, { closeButton: true }, ToastState)
    const id = ToastState.create({ message: 'closable' })
    const li = root.querySelector<HTMLLIElement>(`li[data-notify-toast][data-id="${id}"]`)
    const closeBtn = li?.querySelector<HTMLButtonElement>('[data-close-button]')
    expect(closeBtn).toBeTruthy()
    closeBtn?.click()
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(ToastState.getActiveToasts()).toHaveLength(0)
        resolve()
      }, TIME_BEFORE_UNMOUNT + 50)
    })
  })

  it('action button renders and clicks invoke dismiss', () => {
    controller = mountToaster(root, {}, ToastState)
    const id = ToastState.create({
      message: 'actionable',
      action: { label: 'Undo' }
    })
    const li = root.querySelector<HTMLLIElement>(`li[data-notify-toast][data-id="${id}"]`)
    const actionBtn = li?.querySelector<HTMLButtonElement>('[data-action]')
    expect(actionBtn).toBeTruthy()
    expect(actionBtn?.textContent).toBe('Undo')
    actionBtn?.click()
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(ToastState.getActiveToasts()).toHaveLength(0)
        resolve()
      }, TIME_BEFORE_UNMOUNT + 50)
    })
  })

  it('action button with closeOnClick=false does NOT dismiss', () => {
    controller = mountToaster(root, {}, ToastState)
    let clicked = false
    const id = ToastState.create({
      message: 'sticky action',
      action: {
        label: 'No close',
        onClick: () => {
          clicked = true
        },
        closeOnClick: false
      }
    })
    const li = root.querySelector<HTMLLIElement>(`li[data-notify-toast][data-id="${id}"]`)
    const actionBtn = li?.querySelector<HTMLButtonElement>('[data-action]')
    actionBtn?.click()
    expect(clicked).toBe(true)
    expect(ToastState.getActiveToasts()).toHaveLength(1)
  })

  // --- Adversarial tests added after attempt-1 verifier FAIL ------------
  // Both tests assert on the DOM after a same-id update, which is the
  // scenario the 76-test suite originally missed. They pin the
  // shallow-snapshot re-construction behavior of the renderer.

  it('same-id update re-renders type/title on the existing <li>', () => {
    controller = mountToaster(root, {}, ToastState)
    ToastState.create({ message: 'A', id: 'x', type: 'loading' })
    const liBefore = root.querySelector<HTMLLIElement>(
      'li[data-notify-toast][data-id="x"]'
    )
    expect(liBefore?.getAttribute('data-type')).toBe('loading')
    expect(liBefore?.textContent).toContain('A')

    // Same id, different type/title — the <li> should mutate in place.
    ToastState.create({ message: 'B', id: 'x', type: 'success' })

    const liAfter = root.querySelector<HTMLLIElement>(
      'li[data-notify-toast][data-id="x"]'
    )
    // Same DOM node identity (option (a) — fillToastContent, not detach+create)
    expect(liAfter).toBe(liBefore)
    expect(liAfter?.getAttribute('data-type')).toBe('success')
    expect(liAfter?.textContent).toContain('B')
    // Loading-only [data-disabled] should be gone
    expect(liAfter?.querySelector('[data-close-button][data-disabled="true"]')).toBeNull()
  })

  it('toast.promise() updates DOM to success after resolve', async () => {
    controller = mountToaster(root, {}, ToastState)
    // Schedule the promise resolution for the NEXT microtask so we can
    // capture the loading state synchronously first.
    const resolvedPromise = Promise.resolve({ name: 'Sam' })
    const result = toast.promise(resolvedPromise, {
      loading: 'Loading...',
      success: (data) => `Hi ${(data as { name: string }).name}`,
      error: 'Fail'
    })
    // The promise result is either { id, unwrap } or { unwrap }.
    const id = (result as { id?: string | number }).id
    expect(id).toBeDefined()

    // The renderer's subscriber runs synchronously inside `create()`, so
    // the loading <li> is already mounted before any microtask drains.
    const loadingLi = root.querySelector<HTMLLIElement>(
      `li[data-notify-toast][data-id="${String(id)}"]`
    )
    expect(loadingLi?.getAttribute('data-type')).toBe('loading')
    expect(loadingLi?.textContent).toContain('Loading...')

    // Flush the microtask queue so the success handler runs and the
    // state publishes the merged update event.
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    const successLi = root.querySelector<HTMLLIElement>(
      `li[data-notify-toast][data-id="${String(id)}"]`
    )
    expect(successLi?.getAttribute('data-type')).toBe('success')
    expect(successLi?.textContent).toContain('Hi Sam')
    expect(successLi?.textContent).not.toContain('Loading...')
  })

  it('toast.promise() updates DOM to error after reject', async () => {
    controller = mountToaster(root, {}, ToastState)
    const rejectedPromise = Promise.reject(new Error('boom'))
    // Prevent the unhandled-rejection warning in vitest.
    rejectedPromise.catch(() => {})
    const result = toast.promise(rejectedPromise, {
      loading: 'Loading...',
      success: 'Done',
      error: 'Could not load'
    })
    const id = (result as { id?: string | number }).id
    expect(id).toBeDefined()

    // Loading <li> is mounted synchronously.
    const loadingLi = root.querySelector<HTMLLIElement>(
      `li[data-notify-toast][data-id="${String(id)}"]`
    )
    expect(loadingLi?.getAttribute('data-type')).toBe('loading')

    // Flush the microtask queue so the catch handler runs and the
    // state publishes the merged update event.
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    const errorLi = root.querySelector<HTMLLIElement>(
      `li[data-notify-toast][data-id="${String(id)}"]`
    )
    expect(errorLi?.getAttribute('data-type')).toBe('error')
    expect(errorLi?.textContent).toContain('Could not load')
  })
})
