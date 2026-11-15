import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { mountToaster } from '../../src/core/renderer'
import { ToastState, resetToastState } from '../../src/core/state'
import { TIME_BEFORE_UNMOUNT } from '../../src/core/constants'
import { toast } from '../../src/api/toast'
import type { ToasterController } from '../../src/core/types'

type PointerFields = {
  clientX?: number
  clientY?: number
  pointerId?: number
  button?: number
}

/** jsdom has no PointerEvent: a plain Event carries the pointer fields. */
const pointer = (target: EventTarget, type: string, init: PointerFields = {}): Event => {
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.assign(event, { clientX: 0, clientY: 0, pointerId: 1, button: 0, ...init })
  target.dispatchEvent(event)
  return event
}

const key = (target: EventTarget, init: KeyboardEventInit): KeyboardEvent => {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init })
  target.dispatchEvent(event)
  return event
}

const media = (matches: boolean) =>
  Object.assign(new EventTarget(), {
    matches,
    media: '',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
  })

describe('renderer coverage', () => {
  let root: HTMLDivElement
  let controller: ToasterController | undefined

  const mount = (options = {}) => {
    controller = mountToaster(root, options, ToastState)
    return controller
  }
  const toastNode = (id: string | number) =>
    root.querySelector<HTMLLIElement>(`[data-notify-toast][data-id="${id}"]`)!
  const container = () => root.querySelector<HTMLOListElement>('[data-notify-toaster]')!

  beforeEach(() => {
    vi.useFakeTimers()
    resetToastState()
    document.body.innerHTML = ''
    root = document.createElement('div')
    document.body.appendChild(root)
  })

  afterEach(() => {
    controller?.destroy()
    controller = undefined
    resetToastState()
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  it('re-measures resized toasts on the next frame and skips stale nodes', async () => {
    let observerCallback: ResizeObserverCallback = () => {}
    const observed: Element[] = []
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: ResizeObserverCallback) {
          observerCallback = callback
        }
        observe = (node: Element) => observed.push(node)
        unobserve = vi.fn()
        disconnect = vi.fn()
      }
    )
    const frames: FrameRequestCallback[] = []
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.push(callback)
      return frames.length
    })
    const cancel = vi.fn()
    vi.stubGlobal('cancelAnimationFrame', cancel)
    mount()
    toast('One', { id: 'one' })
    toast('Two', { id: 'two' })
    await Promise.resolve()
    const one = toastNode('one')
    vi.spyOn(one, 'getBoundingClientRect').mockReturnValue({ height: 64 } as DOMRect)
    const stranger = document.createElement('li')
    const fire = (nodes: Element[]) =>
      observerCallback(
        nodes.map(target => ({ target }) as ResizeObserverEntry),
        {} as ResizeObserver
      )
    fire([one, stranger])
    fire([one])
    expect(frames).toHaveLength(1)
    frames.shift()!(0)
    expect(one.style.getPropertyValue('--initial-height')).toBe('64px')
    // Same height again: no re-render needed.
    fire([one])
    frames.shift()!(0)
    // A pending frame is cancelled on destroy.
    fire([toastNode('two')])
    controller!.destroy()
    expect(cancel).toHaveBeenCalled()
  })

  it('holds auto-dismiss while the tab is hidden and resumes the remaining time', () => {
    let hidden = true
    vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden)
    mount({ duration: 1000 })
    toast('Created while hidden', { id: 'hidden' })
    vi.advanceTimersByTime(5000)
    expect(toastNode('hidden').dataset['removed']).toBe('false')
    hidden = false
    document.dispatchEvent(new Event('visibilitychange'))
    vi.advanceTimersByTime(400)
    hidden = true
    document.dispatchEvent(new Event('visibilitychange'))
    vi.advanceTimersByTime(5000)
    expect(toastNode('hidden').dataset['removed']).toBe('false')
    hidden = false
    document.dispatchEvent(new Event('visibilitychange'))
    vi.advanceTimersByTime(700)
    expect(toastNode('hidden').dataset['removed']).toBe('true')
  })

  it('runs onAutoClose and still dismisses when it throws', () => {
    mount()
    const onAutoClose = vi.fn(() => {
      throw new Error('callback')
    })
    toast('Auto', { id: 'auto', duration: 100, onAutoClose })
    expect(() => vi.advanceTimersByTime(100)).toThrow('callback')
    expect(onAutoClose).toHaveBeenCalled()
    expect(toastNode('auto').dataset['removed']).toBe('true')
  })

  it('pauses on hover and focus, and resumes only after both end', () => {
    mount({ duration: 1000 })
    toast('Hover', { id: 'hover' })
    const node = toastNode('hover')
    node.dispatchEvent(new Event('mouseenter'))
    node.dispatchEvent(new Event('mouseenter'))
    node.dispatchEvent(new FocusEvent('focusin'))
    node.dispatchEvent(new FocusEvent('focusin'))
    vi.advanceTimersByTime(3000)
    node.dispatchEvent(new Event('mouseleave'))
    node.dispatchEvent(new Event('mouseleave'))
    vi.advanceTimersByTime(3000)
    expect(node.dataset['removed']).toBe('false')
    const inner = document.createElement('span')
    node.append(inner)
    node.dispatchEvent(new FocusEvent('focusout', { relatedTarget: inner }))
    vi.advanceTimersByTime(3000)
    expect(node.dataset['removed']).toBe('false')
    node.dispatchEvent(new FocusEvent('focusout'))
    vi.advanceTimersByTime(1000)
    expect(node.dataset['removed']).toBe('true')
  })

  it('keeps a paused remaining time across updates and restarts on duration changes', () => {
    mount({ duration: 1000 })
    toast('First', { id: 'paused' })
    const node = toastNode('paused')
    node.dispatchEvent(new Event('mouseenter'))
    // Re-render while hovered with the same and then a new duration.
    toast('Second', { id: 'paused' })
    toast('Third', { id: 'paused', duration: 2000 })
    controller!.update({ duration: 1500 })
    node.dispatchEvent(new Event('mouseleave'))
    vi.advanceTimersByTime(1999)
    expect(node.dataset['removed']).toBe('false')
    vi.advanceTimersByTime(1)
    expect(node.dataset['removed']).toBe('true')

    // Toasts created while hovered start paused.
    toast('Later', { id: 'later' })
    const later = toastNode('later')
    later.dispatchEvent(new Event('mouseenter'))
    toast('Infinite', { id: 'later', duration: Infinity })
    later.dispatchEvent(new Event('mouseleave'))
    vi.advanceTimersByTime(10_000)
    expect(later.dataset['removed']).toBe('false')
    toast('Elapsed', { id: 'later', duration: 500 })
    vi.advanceTimersByTime(500)
    expect(later.dataset['removed']).toBe('true')
  })

  it('does not resume loading toasts after hover', () => {
    mount()
    toast.loading('Loading', { id: 'busy' })
    const node = toastNode('busy')
    expect(node.getAttribute('aria-busy')).toBe('true')
    node.dispatchEvent(new Event('mouseenter'))
    node.dispatchEvent(new Event('mouseleave'))
    vi.advanceTimersByTime(60_000)
    expect(node.dataset['removed']).toBe('false')
  })

  it('follows the system theme, including legacy and throwing media queries', () => {
    const dark = media(true)
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => dark)
    )
    mount({ theme: 'system' })
    expect(container().dataset['notifyTheme']).toBe('dark')
    dark.matches = false
    dark.dispatchEvent(new Event('change'))
    expect(container().dataset['notifyTheme']).toBe('light')
    controller!.update({ theme: 'dark' })
    expect(container().dataset['notifyTheme']).toBe('dark')
    controller!.destroy()

    const legacy = { matches: true, addListener: vi.fn(), removeListener: vi.fn() }
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => legacy)
    )
    mount({ theme: 'system' })
    expect(legacy.addListener).toHaveBeenCalled()
    controller!.destroy()
    expect(legacy.removeListener).toHaveBeenCalled()

    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => {
        throw new Error('blocked')
      })
    )
    mount({ theme: 'system' })
    expect(container().dataset['notifyTheme']).toBe('light')
    controller!.destroy()

    vi.stubGlobal('matchMedia', undefined)
    mount({ theme: 'system' })
    expect(container().dataset['notifyTheme']).toBe('light')
  })

  it('expands on focus, stays expanded while a swipe is in progress and collapses on blur', () => {
    mount()
    toast('A', { id: 'a' })
    const list = container()
    list.dispatchEvent(new FocusEvent('focusin'))
    expect(list.dataset['lifted']).toBe('false')
    toast('B', { id: 'b' })
    list.dispatchEvent(new FocusEvent('focusin'))
    expect(list.dataset['lifted']).toBe('true')
    list.dispatchEvent(new FocusEvent('focusout', { relatedTarget: toastNode('a') }))
    expect(list.dataset['lifted']).toBe('true')
    list.dispatchEvent(new FocusEvent('focusout'))
    expect(list.dataset['lifted']).toBe('false')

    list.dispatchEvent(new Event('mouseenter'))
    list.dispatchEvent(new Event('mousemove'))
    toastNode('a').dataset['swiping'] = 'true'
    pointer(toastNode('a'), 'pointerdown', { button: 2 })
    list.dispatchEvent(new Event('mouseleave'))
    expect(list.dataset['lifted']).toBe('true')
    list.dispatchEvent(new FocusEvent('focusout'))
    expect(list.dataset['lifted']).toBe('true')
    pointer(list, 'pointerup')
    list.dispatchEvent(new Event('mouseleave'))
    expect(list.dataset['lifted']).toBe('false')
  })

  it('handles Escape, Delete and the focus hotkey from the keyboard', () => {
    mount({ hotkey: ['ctrlKey', 'metaKey', 'shiftKey', 'KeyN'] })
    toast('A', { id: 'a' })
    toast('B', { id: 'b', dismissible: false })
    const list = container()
    const input = document.createElement('input')
    document.body.append(input)

    // Hotkey ignored in fields and when modifiers do not match.
    input.focus()
    key(input, { code: 'KeyN', ctrlKey: true, metaKey: true, shiftKey: true })
    expect(document.activeElement).toBe(input)
    key(document.body, { code: 'KeyN', ctrlKey: true })
    expect(document.activeElement).toBe(input)
    key(document.body, { code: 'KeyN', ctrlKey: true, metaKey: true, shiftKey: true })
    expect(document.activeElement).toBe(toastNode('b'))

    // Escape collapses an expanded stack; a second Escape does nothing.
    list.dispatchEvent(new FocusEvent('focusin'))
    expect(key(document.body, { key: 'Escape' }).defaultPrevented).toBe(true)
    expect(list.dataset['lifted']).toBe('false')
    expect(key(document.body, { key: 'Escape' }).defaultPrevented).toBe(false)

    // Delete keeps non-dismissible toasts and ignores editable fields.
    expect(key(document.body, { key: 'Delete' }).defaultPrevented).toBe(false)
    const editable = document.createElement('div')
    editable.setAttribute('contenteditable', 'true')
    toastNode('a').append(editable)
    editable.focus()
    expect(key(editable, { key: 'Backspace' }).defaultPrevented).toBe(false)
    toastNode('a').focus()
    expect(key(toastNode('a'), { key: 'Backspace' }).defaultPrevented).toBe(true)
    expect(toastNode('a').dataset['removed']).toBe('true')

    // Alias names and an empty hotkey list.
    controller!.update({ hotkey: ['control', 'meta', 'alt', 'shift'] })
    key(document.body, { ctrlKey: true, metaKey: true, altKey: true, shiftKey: true })
    controller!.update({ hotkey: [] })
    key(document.body, { code: 'KeyT', altKey: true })
  })

  it('focuses the container when the hotkey finds no toast', () => {
    mount()
    key(document.body, { code: 'KeyT', altKey: true })
    expect(document.activeElement).toBe(container())
  })

  it('moves focus to the next toast or back to the opener when a focused toast leaves', () => {
    mount()
    const opener = document.createElement('button')
    document.body.append(opener)
    toast('A', { id: 'a' })
    toast('B', { id: 'b' })
    opener.focus()
    toastNode('b').focus()
    container().dispatchEvent(new FocusEvent('focusin', { relatedTarget: opener }))
    toast.dismiss('b')
    expect(document.activeElement).toBe(toastNode('a'))
    toast.dismiss('a')
    expect(document.activeElement).toBe(opener)

    // A failing focus() falls back to blur.
    toast('C', { id: 'c' })
    toastNode('c').focus()
    vi.spyOn(opener, 'focus').mockImplementation(() => {
      throw new Error('no focus')
    })
    toast.dismiss('c')
    expect(document.activeElement).not.toBe(toastNode('c'))
  })

  it('renders close buttons, custom content, factories and grouped actions', () => {
    mount({ closeButton: true })
    const cleanup = vi.fn()
    let dismissCustom = () => {}
    toast.custom(
      (element, api) => {
        element.textContent = 'Custom'
        dismissCustom = api.dismiss
        return cleanup
      },
      { id: 'custom' }
    )
    const element = document.createElement('strong')
    element.textContent = 'Element'
    toast.custom(element, { id: 'element' })
    expect(toastNode('element').querySelector('[data-custom] strong')).toBe(element)
    expect(toastNode('custom').querySelector('[data-close-button]')).toBeNull()

    const cancel = vi.fn()
    const action = vi.fn((event: Event) => event.preventDefault())
    toast('Title', {
      id: 'full',
      description: () => 'Factory description',
      descriptionClassName: 'muted',
      cancel: { label: 'Cancel', onClick: cancel },
      action: { label: 'Keep', onClick: action },
    })
    const full = toastNode('full')
    expect(full.querySelector('[data-description]')!.className).toBe('muted')
    expect(full.querySelector('[data-actions] [data-cancel]')).toBeTruthy()
    full.querySelector<HTMLButtonElement>('[data-action]')!.click()
    expect(full.dataset['removed']).toBe('false')
    full.querySelector<HTMLButtonElement>('[data-cancel]')!.click()
    expect(full.dataset['removed']).toBe('true')

    toast('Open', { id: 'open', action: { label: false, onClick: vi.fn(), closeOnClick: false } })
    toastNode('open').querySelector<HTMLButtonElement>('[data-action]')!.click()
    expect(toastNode('open').dataset['removed']).toBe('false')

    toast('Stuck', { id: 'stuck', dismissible: false, description: null })
    toastNode('stuck').querySelector<HTMLButtonElement>('[data-close-button]')!.click()
    expect(toastNode('stuck').dataset['removed']).toBe('false')
    toastNode('open').querySelector<HTMLButtonElement>('[data-close-button]')!.click()
    expect(toastNode('open').dataset['removed']).toBe('true')

    dismissCustom()
    vi.advanceTimersByTime(TIME_BEFORE_UNMOUNT)
    expect(cleanup).toHaveBeenCalledTimes(1)
  })

  it('activates onClick from the body and the keyboard, but not from controls', () => {
    mount()
    const onClick = vi.fn()
    toast('Clickable', { id: 'click', onClick, action: { label: 'Go', onClick: vi.fn() } })
    const node = toastNode('click')
    node.click()
    node.querySelector<HTMLButtonElement>('[data-action]')
    key(node, { key: 'Enter' })
    key(node, { key: 'x' })
    const child = document.createElement('span')
    node.append(child)
    key(child, { key: ' ' })
    expect(onClick).toHaveBeenCalledTimes(2)

    toast('Plain', { id: 'plain' })
    toastNode('plain').click()
    key(toastNode('plain'), { key: 'Enter' })
  })

  it('swipes toward allowed edges, dampens the others and cancels cleanly', () => {
    mount({ position: 'bottom-right' })
    toast('Swipe', { id: 'swipe', onClick: vi.fn() })
    const node = toastNode('swipe')

    // Secondary button and control targets do not start a swipe.
    pointer(node, 'pointerdown', { button: 2 })
    const button = document.createElement('button')
    node.append(button)
    pointer(button, 'pointerdown')
    expect(node.dataset['swiping']).toBe('false')

    // Wrong direction is dampened and snaps back; the next click is ignored.
    pointer(node, 'pointerdown', { clientX: 100, clientY: 100 })
    pointer(node, 'pointermove', { clientX: 60, clientY: 100 })
    expect(Number.parseFloat(node.style.getPropertyValue('--swipe-amount-x'))).toBeGreaterThan(-40)
    pointer(node, 'pointerup', { clientX: 60, clientY: 100 })
    expect(node.style.getPropertyValue('--swipe-amount-x')).toBe('0px')
    node.click()
    vi.advanceTimersByTime(1)

    // Vertical: up is dampened, down is free.
    pointer(node, 'pointerdown', { clientX: 100, clientY: 100 })
    pointer(node, 'pointermove', { clientX: 100, clientY: 60 })
    pointer(node, 'pointermove', { clientX: 100, clientY: 140 })
    expect(node.style.getPropertyValue('--swipe-amount-y')).toBe('40px')
    pointer(node, 'pointercancel')
    expect(node.style.getPropertyValue('--swipe-amount-y')).toBe('0px')

    // Moves are ignored while text is selected.
    vi.spyOn(window, 'getSelection').mockReturnValue({
      toString: () => 'selected',
    } as Selection)
    pointer(node, 'pointerdown', { clientX: 100, clientY: 100 })
    pointer(node, 'pointermove', { clientX: 200, clientY: 100 })
    expect(node.style.getPropertyValue('--swipe-amount-x')).toBe('0px')
    pointer(node, 'pointerup')
    vi.mocked(window.getSelection).mockRestore()

    // A long swipe right dismisses; later pointer events are ignored.
    pointer(node, 'pointerdown', { clientX: 100, clientY: 100 })
    pointer(node, 'pointermove', { clientX: 200, clientY: 100 })
    pointer(node, 'pointerup', { clientX: 200, clientY: 100 })
    expect(node.dataset['swipeDirection']).toBe('right')
    expect(node.dataset['removed']).toBe('true')
    pointer(node, 'pointerup')
  })

  it('swipes a top toast up and keeps loading and non-dismissible toasts in place', () => {
    mount({ position: 'top-center' })
    toast('Up', { id: 'up' })
    const node = toastNode('up')
    pointer(node, 'pointerdown', { clientX: 0, clientY: 100 })
    pointer(node, 'pointermove', { clientX: 40, clientY: 100 })
    expect(node.style.getPropertyValue('--swipe-amount-x')).toBe('0px')
    pointer(node, 'pointerup')
    pointer(node, 'pointerdown', { clientX: 0, clientY: 100 })
    pointer(node, 'pointermove', { clientX: 0, clientY: 20 })
    pointer(node, 'pointerup', { clientX: 0, clientY: 20 })
    expect(node.dataset['swipeDirection']).toBe('up')

    toast.loading('Busy', { id: 'busy' })
    pointer(toastNode('busy'), 'pointerdown')
    expect(toastNode('busy').dataset['swiping']).toBe('false')
    toast('Pinned', { id: 'pinned', dismissible: false })
    pointer(toastNode('pinned'), 'pointerdown')
    pointer(toastNode('pinned'), 'pointermove', { clientX: 90 })
    pointer(toastNode('pinned'), 'pointerup')
    expect(toastNode('pinned').dataset['removed']).toBe('false')
  })

  it('waits for the longest real transition before removing a dismissed toast', () => {
    mount()
    const real = window.getComputedStyle
    vi.spyOn(window, 'getComputedStyle').mockImplementation(element => {
      const style = real(element)
      if (!(element as HTMLElement).matches?.('[data-notify-toast]')) return style
      return Object.assign(Object.create(style), {
        transitionDuration: '0.4s, 200ms, bogus',
        transitionDelay: '0s',
        transitionProperty: 'transform, opacity, height',
      }) as CSSStyleDeclaration
    })
    toast('Animated', { id: 'animated' })
    const node = toastNode('animated')
    toast.dismiss('animated')
    const end = (propertyName: string, target: EventTarget = node) => {
      const event = new Event('transitionend', { bubbles: true })
      Object.assign(event, { propertyName })
      target.dispatchEvent(event)
    }
    const child = document.createElement('span')
    node.append(child)
    end('transform', child)
    end('opacity')
    expect(node.isConnected).toBe(true)
    end('transform')
    expect(node.isConnected).toBe(false)

    // The fallback timer removes it when transitionend never arrives.
    toast('Silent', { id: 'silent' })
    toast.dismiss('silent')
    vi.advanceTimersByTime(500)
    expect(root.querySelector('[data-id="silent"]')).toBeNull()

    // Re-creating a toast during its exit cancels the removal.
    toast('Back', { id: 'back' })
    toast.dismiss('back')
    toast('Back again', { id: 'back' })
    vi.advanceTimersByTime(500)
    expect(toastNode('back').dataset['removed']).toBe('false')
  })

  it('removes immediately under reduced motion and tolerates dismissals without a node', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => media(true))
    )
    mount()
    toast('Quick', { id: 'quick' })
    toast.dismiss('quick')
    vi.advanceTimersByTime(TIME_BEFORE_UNMOUNT)
    expect(root.querySelector('[data-id="quick"]')).toBeNull()
    toast.dismiss('nobody')
    vi.advanceTimersByTime(1)

    // Toasts for another toaster are not rendered here.
    toast('Elsewhere', { id: 'elsewhere', toasterId: 'other' })
    expect(root.querySelector('[data-id="elsewhere"]')).toBeNull()
  })

  it('applies every controller option to existing toasts', () => {
    mount()
    toast('A', { id: 'a', testId: 'first', className: 'one' })
    toast('B', { id: 'b' })
    const updated = controller!.update({
      visibleToasts: 1,
      closeButton: true,
      richColors: true,
      gap: 20,
      expand: true,
      position: 'top-left',
      dir: 'rtl',
      invert: true,
      unstyled: true,
      closeButtonAriaLabel: 'Dismiss',
      style: { '--normal-bg': 'red' },
      hotkey: ['altKey', 'KeyY'],
      className: 'custom-toaster',
      customAriaLabel: 'Alerts',
    })
    expect(updated).toBe(controller)
    const list = container()
    expect(list.getAttribute('dir')).toBe('rtl')
    expect(list.className).toBe('custom-toaster')
    expect(list.getAttribute('aria-label')).toBe('Alerts')
    expect(list.style.getPropertyValue('--normal-bg')).toBe('red')
    expect(list.style.getPropertyValue('--gap')).toBe('20px')
    expect(toastNode('a').getAttribute('aria-hidden')).toBe('true')
    expect(toastNode('a').dataset['yPosition']).toBe('top')
    expect(toastNode('b').querySelector('[data-close-button]')!.getAttribute('aria-label')).toBe(
      'Dismiss'
    )
    toast('A2', { id: 'a', testId: 'second' })
    expect(toastNode('a').dataset['testid']).toBe('second')
    controller!.update({ dir: 'auto', containerAriaLabel: 'Inbox' })
    controller!.update()

    // A toaster id switches which toasts this container shows.
    toast('Scoped', { id: 'scoped', toasterId: 'side' })
    controller!.update({ id: 'side' })
    expect(toastNode('scoped')).toBeTruthy()
    expect(root.querySelector('[data-id="b"]')).toBeNull()
  })

  it('makes update and dismiss no-ops after destroy and restores focus', () => {
    mount()
    toast('Focus', { id: 'focus' })
    const opener = document.createElement('button')
    document.body.append(opener)
    container().dispatchEvent(new FocusEvent('focusin', { relatedTarget: opener }))
    toastNode('focus').focus()
    toast('Leaving', { id: 'leaving' })
    toast.dismiss('leaving')
    const list = container()
    controller!.destroy()
    controller!.destroy()
    expect(controller!.update({ gap: 4 })).toBe(controller)
    expect(list.isConnected).toBe(false)
    expect(document.activeElement).toBe(opener)
  })

  it('escapes ids without CSS.escape', () => {
    vi.stubGlobal('CSS', undefined)
    mount()
    toast('Quoted', { id: 'say "hi"' })
    toast.dismiss('say "hi"')
    expect(root.querySelector('[data-notify-toast]')!.getAttribute('data-removed')).toBe('true')
  })

  it('destroys itself when the first render throws', () => {
    toast.custom(
      () => {
        throw new Error('render')
      },
      { id: 'boom' }
    )
    expect(() => mount()).toThrow('render')
    expect(root.querySelector('[data-notify-toaster]')).toBeNull()
    controller = undefined
  })
})
