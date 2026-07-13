// Vanilla DOM renderer. Replaces the React `Toaster` component from the
// legacy multi-framework build with direct DOM manipulation.
//
// Architecture:
//   - One `<ol data-notify-toaster>` per toaster instance.
//   - One `<li data-notify-toast>` per active toast id.
//   - The renderer subscribes to the shared `Observer` and diffs the
//     toast list on each event: ensure the right `<li>`s exist, update
//     data-attributes, re-create the body when the toast content shape
//     changes, and clean up dismissed toasts after `TIME_BEFORE_UNMOUNT`.
//   - All transitions/animations are pure CSS (driven by
//     `data-mounted`, `data-removed`, `data-visible`, `data-front`,
//     `data-expanded`, `data-swiping`, `data-swiped`, `data-swipe-out`,
//     `data-swipe-direction`).
//   - `prefers-reduced-motion` is honored in CSS — the JS only avoids
//     scheduling redundant timers / extra RAF work.
//
// Constraints honored (see scratchpad section 8):
//   - No JSX.
//   - No React / Vue / Svelte / framework imports.
//   - No auto-publish; this file just builds DOM and dispatches events.

import {
  addListener,
  assignOffset,
  canUseDOM,
  cn,
  createEl,
  getDefaultSwipeDirections,
  getDocumentDirection,
  setAttrs,
  setInnerHTML
} from './dom-helpers'
import { CLOSE_ICON, getIcon, getLoaderMarkup } from './icons'
import type { ToastState } from './state'
import { ToastState as DefaultToastState } from './state'
import {
  GAP,
  SWIPE_THRESHOLD,
  TIME_BEFORE_UNMOUNT,
  TOAST_LIFETIME,
  TOAST_WIDTH,
  VISIBLE_TOASTS_AMOUNT
} from './constants'
import type {
  Position,
  RenderableOrFactory,
  SwipeDirection,
  Theme,
  ToastAction,
  ToastOptions,
  ToastT,
  ToasterController,
  ToasterOptions
} from './types'

/**
 * Public API of the vanilla renderer. Kept as a function (not a class)
 * to match the forms `createFormController(target, options)` shape.
 *
 * The state parameter is injectable so tests can use a fresh observer
 * without mutating the singleton; production callers pass the shared
 * `ToastState` from `core/state.ts`.
 */
export function mountToaster(
  root: HTMLElement,
  options: ToasterOptions = {},
  state: typeof ToastState = DefaultToastState
): ToasterController {
  if (!canUseDOM()) {
    throw new Error('mountToaster() requires a DOM environment')
  }

  const {
    id: toasterId,
    theme = 'light',
    position = 'bottom-right',
    expand = false,
    duration,
    gap = GAP,
    visibleToasts = VISIBLE_TOASTS_AMOUNT,
    closeButton = false,
    className,
    offset,
    mobileOffset,
    dir = getDocumentDirection(),
    richColors = false,
    customAriaLabel,
    containerAriaLabel = 'Notifications'
  } = options

  // Mount the toaster container.
  const [yPart = 'bottom', xPart = 'right'] = position.split('-') as [string, string]
  const container = createEl('ol', {
    'data-notify-toaster': '',
    'data-notify-theme': theme,
    'data-y-position': yPart,
    'data-x-position': xPart,
    'data-lifted': 'true',
    'data-rich-colors': String(richColors),
    tabIndex: -1,
    'aria-label': customAriaLabel ?? containerAriaLabel,
    dir: dir === 'auto' ? getDocumentDirection() : dir
  })

  if (className) container.className = className
  applyContainerStyles(container, { offset, mobileOffset, gap, width: TOAST_WIDTH })

  root.appendChild(container)

  // Internal state: per-toast timer handles + heights.
  const timers = new Map<ToastT['id'], ReturnType<typeof setTimeout>>()
  const cleanups = new Map<ToastT['id'], Array<() => void>>()
  const heights = new Map<ToastT['id'], number>()
  let expanded = false
  let interacting = false
  let currentOptions: ToasterOptions = options
  let currentToasterId = toasterId
  let currentVisibleToasts = visibleToasts
  let currentCloseButton = closeButton
  let currentRichColors = richColors
  let currentDuration = duration
  let currentExpand = expand
  let currentPosition = position
  let currentTheme: Theme = theme
  let currentDir: 'rtl' | 'ltr' | 'auto' = dir

  const removeListeners: Array<() => void> = []

  const onContainerPointerDown = (): void => {
    interacting = true
  }
  const onContainerPointerUp = (): void => {
    interacting = false
  }
  const onContainerMouseEnter = (): void => {
    expanded = true
    renderAll()
  }
  const onContainerMouseMove = (): void => {
    expanded = true
    renderAll()
  }
  const onContainerMouseLeave = (): void => {
    if (!interacting) {
      expanded = false
      renderAll()
    }
  }
  removeListeners.push(
    addListener(container, 'pointerdown', onContainerPointerDown),
    addListener(container, 'pointerup', onContainerPointerUp),
    addListener(container, 'mouseenter', onContainerMouseEnter),
    addListener(container, 'mousemove', onContainerMouseMove),
    addListener(container, 'mouseleave', onContainerMouseLeave)
  )

  // Pause auto-dismiss timers while the document is hidden.
  const onVisibilityChange = (): void => {
    if (typeof document === 'undefined') return
    if (document.hidden) {
      // Pause all live timers; resume on visibility return.
      for (const [id, handle] of timers.entries()) {
        clearTimeout(handle)
        timers.delete(id)
      }
    } else {
      // Restart timers for every active toast.
      restartAllTimers()
    }
  }
  removeListeners.push(addListener(document, 'visibilitychange', onVisibilityChange))

  // --- Per-toast rendering helpers -------------------------------------

  const getPositionForToast = (toast: ToastT): Position =>
    (toast.position as Position | undefined) ?? currentPosition

  const getActiveToasts = (): ToastT[] => state.getActiveToasts()

  const activeMatchingToasts = (): ToastT[] => {
    const all = getActiveToasts()
    return currentToasterId
      ? all.filter((toast) => toast.toasterId === currentToasterId)
      : all.filter((toast) => !toast.toasterId)
  }

  const createToastElement = (toast: ToastT, index: number): HTMLLIElement => {
    const pos = getPositionForToast(toast)
    const [y = 'bottom', x = 'right'] = pos.split('-') as [string, string]
    const isFront = index === 0
    const isVisible = index + 1 <= currentVisibleToasts
    const dismissible = toast.dismissible !== false
    const type = toast.type ?? 'normal'
    const rich = toast.richColors ?? currentRichColors
    const invert = Boolean(toast.invert)
    const duration = toast.duration ?? currentDuration ?? TOAST_LIFETIME
    const disabled = type === 'loading'

    const li = createEl('li', {
      tabIndex: 0,
      'data-notify-toast': '',
      'data-id': String(toast.id),
      'data-type': type,
      'data-styled': 'true',
      'data-rich-colors': String(rich),
      'data-mounted': 'true',
      'data-removed': 'false',
      'data-visible': String(isVisible),
      'data-y-position': y,
      'data-x-position': x,
      'data-index': String(index),
      'data-front': String(isFront),
      'data-swiping': 'false',
      'data-dismissible': String(dismissible),
      'data-invert': String(invert),
      'data-expanded': String(Boolean(expanded || (currentExpand && index === 0))),
      ...(toast.testId ? { 'data-testid': toast.testId } : {})
    }) as HTMLLIElement

    li.style.setProperty('--index', String(index))
    li.style.setProperty('--toasts-before', String(index))
    li.style.setProperty('--z-index', String(1000 - index))
    li.style.setProperty('--initial-height', 'auto')
    li.style.setProperty('--offset', '0px')
    li.style.setProperty('--swipe-amount-x', '0px')
    li.style.setProperty('--swipe-amount-y', '0px')

    // Apply className from toast.
    const toastClasses = cn(toast.className)
    if (toastClasses) li.className = toastClasses

    // Build inner content.
    fillToastContent(li, toast)

    // Bind interactions.
    bindToastInteractions(li, toast)

    // Store the content snapshot so renderAll() can detect updates.
    li.dataset['snapshot'] = getContentSnapshot(toast)
    li.dataset['type'] = type
    li.dataset['dismissible'] = String(dismissible)

    // Schedule auto-dismiss.
    if (duration !== Infinity && !toast.promise && type !== 'loading') {
      const handle = setTimeout(() => {
        toast.onAutoClose?.(toast)
        dismissToast(toast.id)
      }, duration)
      timers.set(toast.id, handle)
    }

    // Measure height once the browser lays the toast out.
    queueMicrotask(() => {
      const rect = li.getBoundingClientRect()
      if (rect.height > 0) {
        heights.set(toast.id, rect.height)
        renderAll()
      }
    })

    return li
  }

  const fillToastContent = (li: HTMLLIElement, toast: ToastT): void => {
    // Clear any prior children.
    while (li.firstChild) li.removeChild(li.firstChild)

    const type = toast.type ?? 'normal'
    const closeBtn = toast.closeButton ?? currentCloseButton
    const dismissible = toast.dismissible !== false
    const disabled = type === 'loading'

    // 1) Close button (only when not loading, not custom, dismissible).
    if (closeBtn && !toast.custom && type !== 'loading') {
      const btn = createEl('button', {
        'data-close-button': '',
        'data-disabled': String(disabled),
        'aria-label': 'Close toast',
        type: 'button'
      })
      setInnerHTML(btn, CLOSE_ICON)
      btn.addEventListener('click', () => {
        if (disabled || !dismissible) return
        toast.onDismiss?.(toast)
        dismissToast(toast.id)
      })
      li.appendChild(btn)
    }

    // 2) Icon (or loader for loading type).
    if (toast.custom) {
      const iconDiv = createEl('div', { 'data-icon': '' })
      const customContainer = createEl('div', { 'data-custom': '' })
      if (typeof toast.custom === 'function') {
        toast.custom(customContainer)
      } else if (toast.custom instanceof HTMLElement) {
        customContainer.appendChild(toast.custom)
      }
      iconDiv.appendChild(customContainer)
      li.appendChild(iconDiv)
    } else if (type === 'loading') {
      const iconDiv = createEl('div', { 'data-icon': '' })
      setInnerHTML(iconDiv, getLoaderMarkup())
      li.appendChild(iconDiv)
    } else {
      const iconMarkup = getIcon(type)
      if (iconMarkup) {
        const iconDiv = createEl('div', { 'data-icon': '' })
        setInnerHTML(iconDiv, iconMarkup)
        li.appendChild(iconDiv)
      }
    }

    // 3) Content (title + description).
    const content = createEl('div', { 'data-content': '' })
    const title = createEl('div', {
      'data-title': ''
    })
    const titleValue = typeof toast.title === 'function' ? toast.title() : toast.title
    if (titleValue !== null && titleValue !== undefined && titleValue !== false) {
      title.textContent = String(titleValue)
    }
    content.appendChild(title)

    if (toast.description !== null && toast.description !== undefined && toast.description !== false) {
      const descEl = createEl('div', { 'data-description': '' })
      const descValue = typeof toast.description === 'function' ? toast.description() : toast.description
      if (descValue !== null && descValue !== undefined && descValue !== false) {
        descEl.textContent = String(descValue)
      }
      if (toast.descriptionClassName) descEl.className = toast.descriptionClassName
      content.appendChild(descEl)
    }
    li.appendChild(content)

    // 4) Cancel + action buttons.
    if (toast.cancel) {
      const btn = buildActionButton(toast.cancel, 'data-cancel', toast, li)
      li.appendChild(btn)
    }
    if (toast.action) {
      const btn = buildActionButton(toast.action, 'data-action', toast, li)
      li.appendChild(btn)
    }
  }

  const buildActionButton = (
    action: ToastAction,
    dataAttr: 'data-cancel' | 'data-action',
    toast: ToastT,
    _li: HTMLLIElement
  ): HTMLButtonElement => {
    const btn = createEl('button', {
      'data-button': '',
      [dataAttr]: '',
      type: 'button'
    })
    if (action.label !== null && action.label !== undefined && action.label !== false) {
      btn.textContent = String(action.label)
    }
    btn.addEventListener('click', (event) => {
      action.onClick?.(event)
      const closeOnClick = action.closeOnClick !== false
      if (closeOnClick) {
        toast.onDismiss?.(toast)
        dismissToast(toast.id)
      }
    })
    return btn
  }

  // --- Interactions: hover pause, swipe-to-dismiss ----------------------

  const dismissToast = (id: ToastT['id']): void => {
    const handle = timers.get(id)
    if (handle) {
      clearTimeout(handle)
      timers.delete(id)
    }
    const node = container.querySelector<HTMLLIElement>(`[data-notify-toast][data-id="${cssEscape(String(id))}"]`)
    if (node) {
      setAttrs(node, { 'data-removed': 'true' })
      window.setTimeout(() => {
        node.remove()
        heights.delete(id)
        cleanups.get(id)?.forEach((fn) => fn())
        cleanups.delete(id)
      }, TIME_BEFORE_UNMOUNT)
    }
    state.dismiss(id)
  }

  const restartAllTimers = (): void => {
    const toasts = activeMatchingToasts()
    for (const toast of toasts) {
      if (toast.promise || (toast.type ?? 'normal') === 'loading') continue
      const duration = toast.duration ?? currentDuration ?? TOAST_LIFETIME
      if (duration === Infinity) continue
      if (timers.has(toast.id)) continue
      const handle = setTimeout(() => {
        toast.onAutoClose?.(toast)
        dismissToast(toast.id)
      }, duration)
      timers.set(toast.id, handle)
    }
  }

  const bindToastInteractions = (li: HTMLLIElement, toast: ToastT): void => {
    const pos = getPositionForToast(toast)
    const [y = 'bottom', x = 'right'] = pos.split('-') as [string, string]
    const dismissible = toast.dismissible !== false
    const type = toast.type ?? 'normal'
    const disabled = type === 'loading'
    const swipeDirections: SwipeDirection[] = getDefaultSwipeDirections(pos)
    // No swipe on centered positions.
    const swipeEnabled = x !== 'center' && y !== 'center'

    let pointerStart: { x: number; y: number } | null = null
    let swipeAxis: 'x' | 'y' | null = null
    let swipeStartTime = 0
    let swipeSwiped = false
    let swipeOut = false

    // Pointer interaction
    const onPointerDown = (event: PointerEvent): void => {
      if (event.button === 2) return
      if (disabled || !dismissible || !swipeEnabled) return
      swipeStartTime = Date.now()
      const target = event.target as HTMLElement | null
      if (target?.tagName === 'BUTTON') return
      try {
        li.setPointerCapture(event.pointerId)
      } catch {
        // ignore — some test envs reject capture for synthetic events
      }
      setAttrs(li, { 'data-swiping': 'true' })
      pointerStart = { x: event.clientX, y: event.clientY }
    }

    const onPointerMove = (event: PointerEvent): void => {
      if (!pointerStart || !dismissible || !swipeEnabled) return
      const isHighlighted =
        typeof window.getSelection === 'function' && (window.getSelection()?.toString().length ?? 0) > 0
      if (isHighlighted) return

      const xDelta = event.clientX - pointerStart.x
      const yDelta = event.clientY - pointerStart.y

      if (!swipeAxis && (Math.abs(xDelta) > 1 || Math.abs(yDelta) > 1)) {
        swipeAxis = Math.abs(xDelta) > Math.abs(yDelta) ? 'x' : 'y'
      }

      const getDampening = (delta: number) => {
        const factor = Math.abs(delta) / 20
        return 1 / (1.5 + factor)
      }

      let swipeAmountX = 0
      let swipeAmountY = 0

      if (swipeAxis === 'y') {
        if (swipeDirections.includes('top') || swipeDirections.includes('bottom')) {
          if (
            (swipeDirections.includes('top') && yDelta < 0) ||
            (swipeDirections.includes('bottom') && yDelta > 0)
          ) {
            swipeAmountY = yDelta
          } else {
            const dampened = yDelta * getDampening(yDelta)
            swipeAmountY = Math.abs(dampened) < Math.abs(yDelta) ? dampened : yDelta
          }
        }
      } else if (swipeAxis === 'x') {
        if (swipeDirections.includes('left') || swipeDirections.includes('right')) {
          if (
            (swipeDirections.includes('left') && xDelta < 0) ||
            (swipeDirections.includes('right') && xDelta > 0)
          ) {
            swipeAmountX = xDelta
          } else {
            const dampened = xDelta * getDampening(xDelta)
            swipeAmountX = Math.abs(dampened) < Math.abs(xDelta) ? dampened : xDelta
          }
        }
      }

      if (Math.abs(swipeAmountX) > 0 || Math.abs(swipeAmountY) > 0) {
        swipeSwiped = true
        setAttrs(li, { 'data-swiped': 'true' })
      }
      li.style.setProperty('--swipe-amount-x', `${swipeAmountX}px`)
      li.style.setProperty('--swipe-amount-y', `${swipeAmountY}px`)
    }

    const onPointerUp = (event: PointerEvent): void => {
      if (swipeOut || !dismissible) {
        pointerStart = null
        swipeAxis = null
        return
      }
      const xAmount = Number(li.style.getPropertyValue('--swipe-amount-x').replace('px', '') || 0)
      const yAmount = Number(li.style.getPropertyValue('--swipe-amount-y').replace('px', '') || 0)
      const timeTaken = Date.now() - swipeStartTime
      const amount = swipeAxis === 'x' ? xAmount : yAmount
      const velocity = Math.abs(amount) / Math.max(timeTaken, 1)

      if (Math.abs(amount) >= SWIPE_THRESHOLD || velocity > 0.11) {
        toast.onDismiss?.(toast)
        const direction: 'left' | 'right' | 'up' | 'down' = (() => {
          if (swipeAxis === 'x') return xAmount > 0 ? 'right' : 'left'
          return yAmount > 0 ? 'down' : 'up'
        })()
        setAttrs(li, {
          'data-swipe-out': 'true',
          'data-swipe-direction': direction,
          'data-removed': 'true'
        })
        swipeOut = true
        try {
          li.releasePointerCapture(event.pointerId)
        } catch {
          // ignore
        }
        window.setTimeout(() => {
          li.remove()
          heights.delete(toast.id)
          cleanups.get(toast.id)?.forEach((fn) => fn())
          cleanups.delete(toast.id)
        }, TIME_BEFORE_UNMOUNT)
        state.dismiss(toast.id)
      } else {
        li.style.setProperty('--swipe-amount-x', '0px')
        li.style.setProperty('--swipe-amount-y', '0px')
        setAttrs(li, { 'data-swiped': 'false', 'data-swiping': 'false' })
        swipeSwiped = false
      }
      pointerStart = null
      swipeAxis = null
    }

    const onPointerCancel = (): void => {
      setAttrs(li, { 'data-swiping': 'false' })
      pointerStart = null
      swipeAxis = null
    }

    const onMouseEnter = (): void => {
      const handle = timers.get(toast.id)
      if (handle) {
        clearTimeout(handle)
        timers.delete(toast.id)
      }
    }
    const onMouseLeave = (): void => {
      if (toast.promise || (toast.type ?? 'normal') === 'loading') return
      const duration = toast.duration ?? currentDuration ?? TOAST_LIFETIME
      if (duration === Infinity) return
      if (timers.has(toast.id)) return
      const handle = setTimeout(() => {
        toast.onAutoClose?.(toast)
        dismissToast(toast.id)
      }, duration)
      timers.set(toast.id, handle)
    }
    const onFocusIn = (): void => onMouseEnter()
    const onFocusOut = (): void => onMouseLeave()

    li.addEventListener('pointerdown', onPointerDown)
    li.addEventListener('pointermove', onPointerMove)
    li.addEventListener('pointerup', onPointerUp)
    li.addEventListener('pointercancel', onPointerCancel)
    li.addEventListener('mouseenter', onMouseEnter)
    li.addEventListener('mouseleave', onMouseLeave)
    li.addEventListener('focusin', onFocusIn)
    li.addEventListener('focusout', onFocusOut)

    const teardown: Array<() => void> = [
      () => li.removeEventListener('pointerdown', onPointerDown),
      () => li.removeEventListener('pointermove', onPointerMove),
      () => li.removeEventListener('pointerup', onPointerUp),
      () => li.removeEventListener('pointercancel', onPointerCancel),
      () => li.removeEventListener('mouseenter', onMouseEnter),
      () => li.removeEventListener('mouseleave', onMouseLeave),
      () => li.removeEventListener('focusin', onFocusIn),
      () => li.removeEventListener('focusout', onFocusOut)
    ]
    cleanups.set(toast.id, teardown)
  }

  // --- Diff + render ---------------------------------------------------

  const renderAll = (): void => {
    const toasts = activeMatchingToasts()

    // Index toasts by id for lookup.
    const existing = new Map<string, HTMLLIElement>()
    for (const child of Array.from(container.querySelectorAll<HTMLLIElement>('[data-notify-toast]'))) {
      const id = child.getAttribute('data-id')
      if (id) existing.set(id, child)
    }

    // Update or create each toast.
    for (let index = 0; index < toasts.length; index += 1) {
      const toast = toasts[index]!
      const id = String(toast.id)
      const existingNode = existing.get(id)
      if (!existingNode) {
        const node = createToastElement(toast, index)
        container.appendChild(node)
      } else {
        // Per contrato §4.3: the `<li>` body must be re-constructed when
        // `type` / `title` / `description` / `action` / `cancel` change
        // (shallow compare). Without this, a `toast.loading('A', {id})`
        // followed by `toast.success('B', {id})` leaves the DOM stuck on
        // the loading variant even though the state has moved on.
        const previousSnapshot = existingNode.dataset['snapshot'] ?? ''
        const newSnapshot = getContentSnapshot(toast)
        if (previousSnapshot !== newSnapshot) {
          // Tear down the old interactions first so the next bindToastInteractions
          // doesn't double up listeners.
          const previousCleanups = cleanups.get(toast.id)
          if (previousCleanups) {
            for (const fn of previousCleanups) fn()
            cleanups.delete(toast.id)
          }
          // Re-fill the inner content with the new fields.
          fillToastContent(existingNode, toast)
          // Re-bind interactions (dismissible / type / position may have
          // changed — e.g. loading → success flips `disabled` to false).
          bindToastInteractions(existingNode, toast)
          // Update the data-type and other top-level attributes.
          const type = toast.type ?? 'normal'
          const dismissible = toast.dismissible !== false
          const rich = toast.richColors ?? currentRichColors
          const invert = Boolean(toast.invert)
          setAttrs(existingNode, {
            'data-type': type,
            'data-dismissible': String(dismissible),
            'data-rich-colors': String(rich),
            'data-invert': String(invert),
            'data-styled': 'true'
          })
          // Cache the new snapshot so the next render can compare.
          existingNode.dataset['snapshot'] = newSnapshot
          existingNode.dataset['type'] = type
          existingNode.dataset['dismissible'] = String(dismissible)
          // Reset the auto-dismiss timer (per contrato: "Reset si cambia
          // la duration"). The new duration might have changed too.
          const newDuration = toast.duration ?? currentDuration ?? TOAST_LIFETIME
          const existingHandle = timers.get(toast.id)
          if (existingHandle) {
            clearTimeout(existingHandle)
            timers.delete(toast.id)
          }
          if (
            newDuration !== Infinity &&
            !toast.promise &&
            (toast.type ?? 'normal') !== 'loading'
          ) {
            const handle = setTimeout(() => {
              toast.onAutoClose?.(toast)
              dismissToast(toast.id)
            }, newDuration)
            timers.set(toast.id, handle)
          }
        }

        // Update index/front/visible/expanded/height data-attributes.
        const isFront = index === 0
        const isVisible = index + 1 <= currentVisibleToasts
        const offset = computeOffset(toasts, heights, index)
        setAttrs(existingNode, {
          'data-index': String(index),
          'data-front': String(isFront),
          'data-visible': String(isVisible),
          'data-expanded': String(Boolean(expanded || (currentExpand && index === 0)))
        })
        existingNode.style.setProperty('--index', String(index))
        existingNode.style.setProperty('--toasts-before', String(index))
        existingNode.style.setProperty('--z-index', String(1000 - index))
        existingNode.style.setProperty('--offset', `${offset}px`)
        existing.delete(id)
      }
    }

    // Anything left in `existing` is no longer in the active list — remove.
    for (const [, node] of existing) {
      const id = node.getAttribute('data-id')
      node.remove()
      if (id) {
        heights.delete(id)
        cleanups.get(id)?.forEach((fn) => fn())
        cleanups.delete(id)
        const handle = timers.get(id)
        if (handle) {
          clearTimeout(handle)
          timers.delete(id)
        }
      }
    }
  }

  // --- Subscriber wiring -----------------------------------------------

  const unsubscribe = state.subscribe((event) => {
    if ('dismiss' in event && event.dismiss) {
      // Mark the matching <li> as removed immediately so the CSS exit
      // animation runs; schedule the actual DOM removal on a microtask
      // so subscribers downstream see the data-removed transition.
      const node = container.querySelector<HTMLLIElement>(
        `[data-notify-toast][data-id="${cssEscape(String(event.id))}"]`
      )
      if (node) {
        setAttrs(node, { 'data-removed': 'true' })
        const cleanupsForToast = cleanups.get(event.id)
        if (cleanupsForToast) {
          // Don't fire cleanup yet — wait for the animation to finish.
        }
        window.setTimeout(() => {
          node.remove()
          heights.delete(event.id)
          const handle = timers.get(event.id)
          if (handle) {
            clearTimeout(handle)
            timers.delete(event.id)
          }
          cleanups.get(event.id)?.forEach((fn) => fn())
          cleanups.delete(event.id)
        }, TIME_BEFORE_UNMOUNT)
      } else {
        // No matching DOM node — just ensure renderAll doesn't recreate it.
        window.setTimeout(renderAll, 0)
      }
      return
    }
    renderAll()
  })

  removeListeners.push(unsubscribe)

  // --- Public controller -----------------------------------------------

  const controller: ToasterController = {
    element: container,
    get options() {
      return currentOptions
    },
    update: (next?: ToasterOptions) => {
      if (next) {
        currentOptions = { ...currentOptions, ...next }
        if (next.id !== undefined) currentToasterId = next.id
        if (next.visibleToasts !== undefined) currentVisibleToasts = next.visibleToasts
        if (next.closeButton !== undefined) currentCloseButton = next.closeButton
        if (next.richColors !== undefined) currentRichColors = next.richColors
        if (next.duration !== undefined) currentDuration = next.duration
        if (next.expand !== undefined) currentExpand = next.expand
        if (next.position !== undefined) {
          currentPosition = next.position
          const [y = 'bottom', x = 'right'] = currentPosition.split('-') as [string, string]
          setAttrs(container, { 'data-y-position': y, 'data-x-position': x })
        }
        if (next.theme !== undefined) {
          currentTheme = next.theme
          setAttrs(container, { 'data-notify-theme': currentTheme })
        }
        if (next.richColors !== undefined) {
          currentRichColors = next.richColors
          setAttrs(container, { 'data-rich-colors': String(currentRichColors) })
        }
        if (next.dir !== undefined) {
          currentDir = next.dir
          setAttrs(container, { dir: currentDir === 'auto' ? getDocumentDirection() : currentDir })
        }
        applyContainerStyles(container, {
          offset: next.offset,
          mobileOffset: next.mobileOffset,
          gap: next.gap ?? GAP,
          width: TOAST_WIDTH
        })
      }
      renderAll()
      restartAllTimers()
      return controller
    },
    destroy: () => {
      // Clear all timers and cleanups.
      for (const handle of timers.values()) clearTimeout(handle)
      timers.clear()
      for (const cleanupsForToast of cleanups.values()) {
        for (const fn of cleanupsForToast) fn()
      }
      cleanups.clear()
      for (const fn of removeListeners) fn()
      removeListeners.length = 0
      container.remove()
    }
  }

  return controller
}

// --- Internal helpers ----------------------------------------------------

const applyContainerStyles = (
  container: HTMLElement,
  opts: { offset?: ToasterOptions['offset']; mobileOffset?: ToasterOptions['mobileOffset']; gap: number; width: number }
): void => {
  const styles = assignOffset(opts.offset, opts.mobileOffset)
  for (const [key, value] of Object.entries(styles)) {
    container.style.setProperty(key, value)
  }
  container.style.setProperty('--width', `${opts.width}px`)
  container.style.setProperty('--gap', `${opts.gap}px`)
  container.style.setProperty('--front-toast-height', '0px')
}

const computeOffset = (
  toasts: ToastT[],
  heights: Map<ToastT['id'], number>,
  index: number
): number => {
  let offset = 0
  for (let i = 0; i < index; i += 1) {
    const h = heights.get(toasts[i]?.id ?? -1) ?? 0
    offset += h
  }
  return offset
}

/**
 * Shallow fingerprint of the toast fields that affect the rendered DOM.
 * Used by `renderAll` to decide whether an existing `<li>` needs to be
 * re-constructed (`fillToastContent` + `bindToastInteractions`) instead
 * of just having its data-attributes refreshed.
 *
 * Per contrato §4.3: type, title, description, action, cancel. We also
 * include `custom`, `closeButton`, `dismissible`, `richColors`, and
 * `invert` because they affect what gets rendered (icon, close button,
 * styling). When a promise settles (`loading` → `success`/`error`),
 * `type`, `title`, and `description` all change in the same tick and
 * the snapshot diff picks that up.
 *
 * `JSON.stringify` skips function values, which is why we coerce the
 * title/description/action label callbacks to a stable `'fn'` sentinel —
 * a different callback reference is the same signal as a value change
 * (re-fill).
 */
const getContentSnapshot = (toast: ToastT): string => {
  return JSON.stringify({
    type: toast.type ?? 'normal',
    title: normalizeForSnapshot(toast.title),
    description: normalizeForSnapshot(toast.description),
    action: toast.action
      ? {
          label: normalizeForSnapshot(toast.action.label as RenderableOrFactory),
          closeOnClick: toast.action.closeOnClick
        }
      : null,
    cancel: toast.cancel
      ? {
          label: normalizeForSnapshot(toast.cancel.label as RenderableOrFactory),
          closeOnClick: toast.cancel.closeOnClick
        }
      : null,
    custom: toast.custom ? 'present' : null,
    closeButton: toast.closeButton,
    dismissible: toast.dismissible,
    richColors: toast.richColors,
    invert: toast.invert
  })
}

const normalizeForSnapshot = (value: RenderableOrFactory): unknown => {
  if (value === null || value === undefined || value === false) return null
  if (typeof value === 'function') return 'fn'
  return value
}

/**
 * Minimal CSS.escape polyfill for older runtimes. Modern jsdom (used
 * by the test suite) and every evergreen browser expose it natively.
 */
function cssEscape(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value)
  }
  return value.replace(/["\\]/g, '\\$&')
}
