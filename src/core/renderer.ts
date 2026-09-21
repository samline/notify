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
    invert = false,
    unstyled = false,
    customAriaLabel,
    containerAriaLabel = 'Notifications',
    closeButtonAriaLabel = 'Close toast',
    style,
    // a11y: hotkey to focus the toaster. Default is `['altKey', 'KeyT']`
    // (alt+T) to match the legacy sonner default. Pass `[]` to
    // disable, or an array of KeyboardEvent.code names to customize.
    // The hotkey is ignored when the user is typing in an input
    // field (see onKeyDown).
    hotkey = ['altKey', 'KeyT']
  } = options

  // Mount the toaster container.
  const [yPart = 'bottom', xPart = 'right'] = position.split('-') as [string, string]
  const container = createEl('ol', {
    'data-notify-toaster': '',
    'data-notify-theme': theme,
    'data-y-position': yPart,
    'data-x-position': xPart,
    // The CSS rule `@media (hover: none) and (pointer: coarse) {
    // [data-lifted='true'] { transform: none } }` is a touch-device
    // safeguard that overrides the `translateX(-50%)` transform used
    // by `position: 'center'` to keep the toaster visually centered
    // when the user hovers it (the lift). The rule should only apply
    // while the toaster is actually lifted (hovered on desktop). On
    // touch devices the toaster is never hovered, so `data-lifted`
    // must be 'false' there — but the previous vanilla build always
    // wrote 'true', which misaligned center-positioned toasters on
    // touch devices. The legacy React build set
    // `data-lifted={expanded.toString()}`. We initialize at 'false'
    // and flip it to 'true' from the mouse-enter/leave handlers.
    // See Fix 12 in the bug report.
    'data-lifted': 'false',
    'data-rich-colors': String(richColors),
    tabIndex: -1,
    'aria-label': customAriaLabel ?? containerAriaLabel,
    // a11y: announce toast add/remove/update events to screen
    // readers. The legacy React build had `aria-live='polite'` on
    // the wrapping `<section>`. We're on an `<ol>` so the semantics
    // are slightly different (list vs region), but `aria-live` on
    // a list of notifications is still the right move — that's
    // exactly what polite live regions are for.
    'aria-live': 'polite',
    'aria-relevant': 'additions text',
    'aria-atomic': 'false',
    dir: dir === 'auto' ? getDocumentDirection() : dir
  })

  if (className) container.className = className
  applyContainerStyles(container, { offset, mobileOffset, gap, width: TOAST_WIDTH, style })

  root.appendChild(container)

  const timers = new Map<
    ToastT['id'],
    { handle: ReturnType<typeof setTimeout>; deadline: number }
  >()
  const cleanups = new Map<ToastT['id'], Array<() => void>>()
  const exitCleanups = new Map<ToastT['id'], () => void>()
  const heights = new Map<ToastT['id'], number>()
  const interactions = new Map<
    ToastT['id'],
    { hovered: boolean; focused: boolean; remainingMs: number | null }
  >()
  const nodeIds = new WeakMap<HTMLLIElement, ToastT['id']>()

  // Start an auto-dismiss timer for the given toast. If a timer
  // already exists, do nothing (caller's responsibility to clear
  // first). Centralises the duration/loading gate so every code
  // path (create, update, mouse-leave, visibility-resume) shares
  // the same logic.
  const startAutoDismiss = (id: ToastT['id'], durationOverride?: number): void => {
    const target = activeMatchingToasts().find((t) => t.id === id)
    if (!target) return
    if ((target.type ?? 'normal') === 'loading') return
    const duration = durationOverride ?? target.duration ?? currentDuration ?? TOAST_LIFETIME
    if (duration === Infinity) return
    if (timers.has(id)) return
    const handle = setTimeout(() => {
      timers.delete(id)
      const live = activeMatchingToasts().find((t) => t.id === id)
      live?.onAutoClose?.(live)
      dismissToast(id)
    }, duration)
    timers.set(id, { handle, deadline: Date.now() + duration })
  }

  // Pause the auto-dismiss timer for the given toast. Computes the
  // remaining time (clamped to >= 0) and returns it so the caller
  // can pass it to startAutoDismiss later.
  const pauseAutoDismiss = (id: ToastT['id']): number => {
    const record = timers.get(id)
    if (!record) return 0
    clearTimeout(record.handle)
    timers.delete(id)
    return Math.max(0, record.deadline - Date.now())
  }
  let expanded = false
  let interacting = false
  let currentOptions: ToasterOptions = options
  let currentToasterId = toasterId
  let currentVisibleToasts = visibleToasts
  let currentCloseButton = closeButton
  let currentRichColors = richColors
  let currentDuration = duration
  let currentGap = gap
  let currentExpand = expand
  let currentPosition = position
  let currentThemePreference: Theme = theme
  let currentTheme: Theme = theme
  // a11y / ux: `theme: 'system'` follows the OS `prefers-color-scheme`
  // media query. The legacy React build had this; the vanilla
  // refactor dropped it. We resolve the system theme on mount
  // (and re-resolve on media-query changes) by reading the
  // `prefers-color-scheme` matchMedia result. If the user's OS
  // is in dark mode, the resolved theme is 'dark'; otherwise
  // 'light'. Falls back gracefully if matchMedia isn't available.
  const resolveSystemTheme = (): Theme => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return 'light'
    }
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } catch {
      return 'light'
    }
  }
  if (currentTheme === 'system') {
    currentTheme = resolveSystemTheme()
    // The container was created with the raw `theme` value above.
    // After resolving 'system' to 'light'/'dark', flip the
    // data-notify-theme attribute to match the resolved value.
    setAttrs(container, { 'data-notify-theme': currentTheme })
  }
  let currentDir: 'rtl' | 'ltr' | 'auto' = dir
  let currentInvert = invert
  let currentUnstyled = unstyled
  let currentCloseButtonAriaLabel = closeButtonAriaLabel
  let currentStyle = style
  // a11y: hotkey to focus the toaster. The legacy React build
  // accepted `hotkey: string[]` (default `['altKey', 'KeyT']`).
  // We honour the same option and pass-through the same
  // KeyboardEvent code names (e.g. 'KeyT', 'altKey', 'metaKey').
  // Initialise from the destructured `hotkey` so the destructure
  // default (['altKey', 'KeyT']) takes effect — initialising
  // directly from `options.hotkey ?? []` would leave it empty
  // when the consumer didn't pass a hotkey, disabling the
  // default alt+T handler.
  let currentHotkey: string[] = hotkey

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
  // The legacy React build only re-rendered on `mouseenter` / `mouseleave`,
  // not on every `mousemove`. The previous vanilla refactor wired
  // `mousemove` to call `renderAll()` too, which re-wrote `--offset` on
  // every pointer wiggle and reset the running transition (the user
  // reported it as "torpe, trabada"). Just flip `expanded` here — the
  // next mouseenter-style change will re-render through the existing
  // path.
  const onContainerMouseMove = (): void => {
    expanded = true
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
      // Pause all live timers. The remaining time for each is
      // stashed in a side-table so the resume branch can restore
      // it (preserves the legacy React `pauseTimer` / `startTimer`
      // behaviour — without this, a 4s toast that the user
      // backgrounded after 3s would dismiss 4s after the tab
      // re-foregrounds, instead of 1s).
      for (const id of [...timers.keys()]) {
        hiddenRemaining.set(id, pauseAutoDismiss(id))
      }
    } else {
      // Resume: each stashed entry is the time-remaining at the
      // moment the tab was hidden. We pass that override into
      // startAutoDismiss so the toast dismisses the expected
      // number of milliseconds after re-foreground (not the full
      // duration — which would make the toast last longer than
      // the user expected).
      //
      // We deliberately do NOT call `restartAllTimers()` here:
      // that helper would clear the freshly-restored timers and
      // re-arm every one of them with the full duration, defeating
      // the whole point of stashing the remaining. Toasts that
      // were created while the tab was hidden have already had
      // their full-duration timer armed by `createToastElement`,
      // so they don't need a separate restart path. See Fix 18 in
      // the bug report.
      for (const [id, remaining] of (hiddenRemaining as Map<ToastT['id'], number>).entries()) {
        startAutoDismiss(id, remaining)
        hiddenRemaining.delete(id)
      }
    }
  }
  // Side-table for "remaining ms at the moment the tab was hidden"
  // per toast id. Cleared on resume.
  const hiddenRemaining: Map<ToastT['id'], number> = new Map()
  removeListeners.push(addListener(document, 'visibilitychange', onVisibilityChange))

  let removeThemeListener: (() => void) | undefined
  const syncThemeSubscription = (): void => {
    removeThemeListener?.()
    removeThemeListener = undefined
    currentTheme =
      currentThemePreference === 'system' ? resolveSystemTheme() : currentThemePreference
    setAttrs(container, { 'data-notify-theme': currentTheme })
    if (
      currentThemePreference !== 'system' ||
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return
    }
    try {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const onMqChange = (): void => {
        currentTheme = resolveSystemTheme()
        setAttrs(container, { 'data-notify-theme': currentTheme })
        renderAll()
      }
      if (typeof mq.addEventListener === 'function') {
        mq.addEventListener('change', onMqChange)
        removeThemeListener = () => mq.removeEventListener('change', onMqChange)
      } else if (typeof mq.addListener === 'function') {
        mq.addListener(onMqChange)
        removeThemeListener = () => mq.removeListener(onMqChange)
      }
    } catch {
      // matchMedia can throw in constrained browser environments.
    }
  }
  syncThemeSubscription()
  removeListeners.push(() => removeThemeListener?.())

  // a11y: keyboard handlers on the document.
  //   - Escape: when focus is inside the toaster, collapse the
  //     expanded stack. The legacy React build did this.
  //   - Delete / Backspace: when focus is on a toast <li>, dismiss
  //     that toast (if dismissible).
  //   - The hotkey (default alt+T) focuses the toaster. The legacy
  //     React build supported `hotkey: string[]`; we accept a
  //     string-array option and translate the entries to KeyboardEvent
  //     properties (e.g. 'altKey', 'KeyT').
  const onKeyDown = (event: KeyboardEvent): void => {
    // Escape: collapse the expanded stack when focus is inside the
    // toaster. We don't auto-dismiss; the user might just want to
    // collapse the stack and read with the screen reader.
    if (
      event.key === 'Escape' &&
      document.activeElement &&
      container.contains(document.activeElement)
    ) {
      if (expanded) {
        expanded = false
        renderAll()
        event.preventDefault()
        return
      }
    }

    // Delete / Backspace: dismiss the focused toast.
    if ((event.key === 'Delete' || event.key === 'Backspace') && document.activeElement) {
      const active = document.activeElement as HTMLElement | null
      const toastNode = active?.closest<HTMLLIElement>('[data-notify-toast]')
      const toastKey = toastNode?.dataset['notifyKey']
      if (toastNode && toastKey) {
        const target = activeMatchingToasts().find((t) => getToastKey(t.id) === toastKey)
        if (target && target.dismissible !== false) {
          // Prevent Backspace from triggering browser back-nav.
          event.preventDefault()
          dismissToast(target.id)
          return
        }
      }
    }

    // Hotkey: focus the toaster (matches legacy sonner default
    // alt+T). The hotkey listener ignores key events when the
    // user is typing in an input/textarea/contenteditable.
    if (currentHotkey.length > 0) {
      const target = event.target as HTMLElement | null
      const tag = target?.tagName
      const isEditable =
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target?.isContentEditable === true
      if (isEditable) return
      const matches = currentHotkey.every((key) => {
        if (key === 'ctrlKey' || key === 'control') return event.ctrlKey
        if (key === 'metaKey' || key === 'meta') return event.metaKey
        if (key === 'altKey' || key === 'alt') return event.altKey
        if (key === 'shiftKey' || key === 'shift') return event.shiftKey
        // For "KeyT" style: match against event.code (layout-independent).
        return event.code === key
      })
      if (matches) {
        event.preventDefault()
        // Focus the front toast (or the container if no toasts).
        const first = container.querySelector<HTMLLIElement>('[data-notify-toast]')
        ;(first ?? container).focus()
      }
    }
  }
  removeListeners.push(addListener(document, 'keydown', onKeyDown as EventListener))

  // a11y: when the toaster mounts, capture the currently focused
  // element so we can restore focus to it on destroy() (matches
  // legacy sonner behaviour — see Fix 18).
  let lastFocusedElementBeforeMount: HTMLElement | null = null
  if (
    canUseDOM() &&
    typeof document.activeElement === 'object' &&
    document.activeElement !== null
  ) {
    const active = document.activeElement as HTMLElement | null
    if (active && !container.contains(active)) {
      lastFocusedElementBeforeMount = active
    }
  }

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

  const measureToastHeight = (node: HTMLLIElement, id: ToastT['id']): void => {
    const previousHeight = node.style.getPropertyValue('height')
    const previousPriority = node.style.getPropertyPriority('height')

    // Collapsed non-front toasts inherit the front toast's height from CSS.
    // Temporarily expose the intrinsic height before updating stack offsets.
    node.style.setProperty('height', 'auto', 'important')
    const height = node.getBoundingClientRect().height
    if (previousHeight) node.style.setProperty('height', previousHeight, previousPriority)
    else node.style.removeProperty('height')

    if (height > 0) {
      heights.set(id, height)
      node.style.setProperty('--initial-height', `${height}px`)
    }
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
      'data-notify-key': getToastKey(toast.id),
      'data-type': type,
      // a11y: mark loading toasts as busy so screen readers
      // announce "busy" while the promise is in flight. The
      // legacy React build omitted this; loading toasts read as
      // silent <li>s to AT.
      'aria-busy': String(type === 'loading'),
      // a11y: surface the type to AT as a label prefix so the
      // user hears "success: saved" rather than just "saved".
      'aria-label': type === 'normal' ? undefined : `${type}: ${toast.title ?? ''}`,
      // `data-styled` is 'true' unless the toast OR the toaster asks
      // for the unstyled variant. The legacy React build computed
      // this from `toast.unstyled || unstyled || toast.jsx`; the
      // vanilla refactor always wrote 'true', so custom content
      // (mounted via `toast.custom`) inherited the default
      // padding/background/border. See Fix 15.
      'data-styled': String(!toast.unstyled && !currentUnstyled && !toast.custom),
      'data-rich-colors': String(rich),
      // Set `data-promise` from `toast.promise` so the CSS rule
      // `[data-promise='true'] [data-icon] > svg` can fade-in the
      // icon. The legacy React build did the same; the vanilla
      // refactor dropped it. See Fix 5 in the bug report.
      'data-promise': String(Boolean(toast.promise)),
      // Start as `false` so the browser paints the toast in its
      // "pre-entry" state (`opacity: 0` + `translateY(100%)`) before we
      // flip it to `'true'` below. Without this two-phase commit, the
      // element is born already mounted and the entry transition (CSS
      // `transition: transform 400ms, opacity 400ms`) never runs — the
      // toast just appears suddenly. See Fix 1 in the bug report.
      'data-mounted': 'false',
      'data-removed': 'false',
      'data-visible': String(isVisible),
      'data-y-position': y,
      'data-x-position': x,
      'data-index': String(index),
      'data-front': String(isFront),
      'data-swiping': 'false',
      'data-swipe-out': 'false',
      'data-dismissible': String(dismissible),
      // Resolve against the toaster-wide `currentInvert` so that
      // a toaster.update({ invert: ... }) actually changes the
      // dark-background style on every existing toast. See Fix 15.
      'data-invert': String(Boolean(toast.invert) || currentInvert),
      // See Fix 13 — the legacy React build applied the
      // `expandByDefault` expansion to every toast via
      // `data-expanded={Boolean(expanded || (expandByDefault && mounted))}`
      // (mounted is a per-toast boolean that flips true after the
      // first paint). The vanilla was gating on `index === 0` which
      // only expanded the front toast; the non-front toasts stayed
      // in the scaled/translated "overlap" pose and the user
      // couldn't see them. Apply `currentExpand` to every toast.
      'data-expanded': String(Boolean(expanded || currentExpand)),
      ...(toast.testId ? { 'data-testid': toast.testId } : {})
    }) as HTMLLIElement
    nodeIds.set(li, toast.id)

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
    li.dataset['snapshot'] = getContentSnapshot(toast, {
      closeButton: currentCloseButton,
      unstyled: currentUnstyled,
      invert: currentInvert,
      richColors: currentRichColors,
      closeButtonAriaLabel: currentCloseButtonAriaLabel
    })
    li.dataset['type'] = type
    li.dataset['dismissible'] = String(dismissible)
    li.dataset['duration'] = String(duration)

    // Schedule auto-dismiss. The legacy React build only skipped the
    // timer when (toast.promise && toastType === 'loading') — i.e. a
    // promise that is still loading. After the promise settles to
    // success/error the type flips away from 'loading' and the
    // auto-dismiss MUST run. The previous vanilla check used
    // `!toast.promise` which skipped the timer for the entire
    // Schedule auto-dismiss via the shared helper. The helper
    // applies the same duration / loading / Infinity gates used by
    // every other entry point (mouse-leave, visibility-resume,
    // controller.update). See Fix 11 for the loading gate.
    startAutoDismiss(toast.id)

    // Two-phase mount: append first (with `data-mounted='false'`), let
    // the browser paint the "off-screen" state, then flip the attribute
    // so the CSS transition runs. `setTimeout(..., 0)` defers to a
    // separate task, guaranteeing a paint in between — `requestAnimationFrame`
    // alone runs *before* the first paint and would skip the transition
    // (same problem the legacy React build avoided by using `useEffect`,
    // which is async-after-paint).
    setTimeout(() => {
      li.setAttribute('data-mounted', 'true')
    }, 0)

    // Measure height once the browser lays the toast out. This runs in a
    // microtask — earlier than the setTimeout above — so `renderAll`
    // re-evaluates with the measured height before the entry transition
    // starts. The renderAll call here is what also keeps
    // `--front-toast-height` in sync (Fix 3).
    queueMicrotask(() => {
      measureToastHeight(li, toast.id)
      renderAll()
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
        // Resolve against the toaster-wide `currentCloseButtonAriaLabel`
        // so a toaster.update({ closeButtonAriaLabel: ... }) takes
        // effect on every subsequent render. See Fix 15.
        'aria-label': currentCloseButtonAriaLabel,
        type: 'button'
      })
      setInnerHTML(btn, CLOSE_ICON)
      btn.addEventListener('click', () => {
        if (disabled || !dismissible) return
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
      } else {
        customContainer.appendChild(toast.custom)
      }
      iconDiv.appendChild(customContainer)
      li.appendChild(iconDiv)
    } else if (type === 'loading') {
      const iconDiv = createEl('div', { 'data-icon': '', 'aria-hidden': 'true' })
      setInnerHTML(iconDiv, getLoaderMarkup())
      li.appendChild(iconDiv)
    } else {
      const iconMarkup = getIcon(type)
      if (iconMarkup) {
        const iconDiv = createEl('div', { 'data-icon': '', 'aria-hidden': 'true' })
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

    if (
      toast.description !== null &&
      toast.description !== undefined &&
      toast.description !== false
    ) {
      const descEl = createEl('div', { 'data-description': '' })
      const descValue =
        typeof toast.description === 'function' ? toast.description() : toast.description
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
        dismissToast(toast.id)
      }
    })
    return btn
  }

  // --- Interactions: hover pause, swipe-to-dismiss ----------------------

  const dismissToast = (id: ToastT['id']): void => {
    pauseAutoDismiss(id)
    const node = container.querySelector<HTMLLIElement>(
      `[data-notify-toast][data-notify-key="${cssEscape(getToastKey(id))}"]`
    )
    if (node) {
      // Flip `data-removed` to start the CSS exit transition. The DOM
      // removal itself is the subscriber's job — `dismissToast` used
      // to schedule its own `setTimeout(node.remove, TIME_BEFORE_UNMOUNT)`
      // here too, which double-removed the node when the subscriber
      // also fired (every dismiss path goes through both). Now we let
      // the subscriber own the entire cleanup so it's only ever
      // scheduled once.
      setAttrs(node, { 'data-removed': 'true' })
    }
    state.dismiss(id)
  }

  const restartAllTimers = (): void => {
    // Clear every existing timer first so the (possibly updated)
    // `currentDuration` is re-applied uniformly. Without this, the
    // `if (timers.has(toast.id)) continue` short-circuit would leave
    // pre-existing timers running with their ORIGINAL duration even
    // after `controller.update({ duration: 5000 })` — see Fix 7 in
    // the bug report. The legacy React build didn't have this issue
    // because its auto-dismiss effect listed `toast` in its deps and
    // re-ran on every toast mutation.
    for (const record of timers.values()) clearTimeout(record.handle)
    timers.clear()

    const toasts = activeMatchingToasts()
    for (const toast of toasts) {
      // See Fix 11 — drop the `toast.promise` check; the type check
      // is the right gate. A promise toast that has settled to
      // success/error should auto-dismiss like any other toast.
      if ((toast.type ?? 'normal') === 'loading') continue
      const interaction = interactions.get(toast.id)
      if (interaction?.hovered || interaction?.focused) {
        interaction.remainingMs = toast.duration ?? currentDuration ?? TOAST_LIFETIME
        continue
      }
      startAutoDismiss(toast.id)
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
        typeof window.getSelection === 'function' &&
        (window.getSelection()?.toString().length ?? 0) > 0
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
        // The DOM removal is handled by the dismiss subscriber
        // (waits for the `swipe-out-*` keyframe + the
        // transform/opacity transitions to finish, then removes
        // the node). Previously this branch scheduled its own
        // `setTimeout(node.remove, TIME_BEFORE_UNMOUNT)`, which
        // duplicated the subscriber's removal and truncated the
        // exit animation halfway through. Just publish the
        // dismiss — the subscriber will do the rest.
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

    // Pause the auto-dismiss on hover / focus so the user can read
    // the toast without it disappearing. One shared interaction record
    // preserves the remaining time across content re-renders and only
    // resumes once both hover and focus have ended.
    const interaction = interactions.get(toast.id) ?? {
      hovered: li.matches(':hover'),
      focused: li.contains(document.activeElement),
      remainingMs: null
    }
    interactions.set(toast.id, interaction)
    const onMouseEnter = (): void => {
      if (interaction.hovered) return
      interaction.hovered = true
      if (!interaction.focused) interaction.remainingMs = pauseAutoDismiss(toast.id)
    }
    const onMouseLeave = (): void => {
      if (!interaction.hovered) return
      interaction.hovered = false
      resumeAfterInteraction()
    }
    const resumeAfterInteraction = (): void => {
      if (interaction.hovered || interaction.focused) return
      // See Fix 11 — drop the `toast.promise` check. The legacy React
      // build restarted the auto-dismiss timer on mouse-leave for
      // resolved promise toasts (success/error type) just like
      // normal toasts. Loading toasts never get an auto-dismiss
      // timer in the first place, so there is nothing to resume.
      if ((toast.type ?? 'normal') === 'loading') {
        interaction.remainingMs = null
        return
      }
      if (interaction.remainingMs !== null && interaction.remainingMs > 0) {
        startAutoDismiss(toast.id, interaction.remainingMs)
      } else {
        // No prior hover captured a remaining (or the toast had
        // `duration: Infinity`). Use the full duration — same
        // behaviour as a freshly-mounted toast.
        startAutoDismiss(toast.id)
      }
      interaction.remainingMs = null
    }
    const onFocusIn = (): void => {
      if (interaction.focused) return
      interaction.focused = true
      if (!interaction.hovered) interaction.remainingMs = pauseAutoDismiss(toast.id)
    }
    const onFocusOut = (event: FocusEvent): void => {
      if (event.relatedTarget instanceof window.Node && li.contains(event.relatedTarget)) return
      interaction.focused = false
      resumeAfterInteraction()
    }
    const onClick = (event: MouseEvent): void => {
      if (disabled || !toast.onClick) return
      const target = event.target as HTMLElement | null
      if (target?.closest('button')) return
      toast.onClick(event)
    }
    const onActivationKeyDown = (event: KeyboardEvent): void => {
      if (!toast.onClick || disabled || (event.key !== 'Enter' && event.key !== ' ')) return
      const target = event.target as HTMLElement | null
      if (target !== li) return
      event.preventDefault()
      toast.onClick(event)
    }

    li.addEventListener('pointerdown', onPointerDown)
    li.addEventListener('pointermove', onPointerMove)
    li.addEventListener('pointerup', onPointerUp)
    li.addEventListener('pointercancel', onPointerCancel)
    li.addEventListener('mouseenter', onMouseEnter)
    li.addEventListener('mouseleave', onMouseLeave)
    li.addEventListener('focusin', onFocusIn)
    li.addEventListener('focusout', onFocusOut)
    li.addEventListener('click', onClick)
    li.addEventListener('keydown', onActivationKeyDown)

    const teardown: Array<() => void> = [
      () => li.removeEventListener('pointerdown', onPointerDown),
      () => li.removeEventListener('pointermove', onPointerMove),
      () => li.removeEventListener('pointerup', onPointerUp),
      () => li.removeEventListener('pointercancel', onPointerCancel),
      () => li.removeEventListener('mouseenter', onMouseEnter),
      () => li.removeEventListener('mouseleave', onMouseLeave),
      () => li.removeEventListener('focusin', onFocusIn),
      () => li.removeEventListener('focusout', onFocusOut),
      () => li.removeEventListener('click', onClick),
      () => li.removeEventListener('keydown', onActivationKeyDown)
    ]
    cleanups.set(toast.id, teardown)
  }

  // --- Diff + render ---------------------------------------------------

  const renderAll = (): void => {
    const toasts = activeMatchingToasts()

    // a11y / ux: when the active list drops to 1 or 0, collapse the
    // expanded stack automatically. The legacy React build did this
    // via `useEffect(..., [toasts])` (deps included `toasts.length`).
    // Without this, a user who hovered the toaster to expand the
    // stack and then saw a toast dismiss would be left looking at
    // an expanded single toast (visually identical to an
    // overlap-pose of 1, but data-expanded=true). We honour the
    // user's intent: expand while there's something to expand.
    if (expanded && toasts.length <= 1) {
      expanded = false
    }

    // Keep the container's `--front-toast-height` in sync with the
    // front toast's actual height. Non-front toasts (in the stack
    // behind the front) have `height: var(--front-toast-height)` per
    // the CSS — without this update they collapse to `0px` and become
    // invisible. The legacy React build set this inline on the
    // container; the vanilla renderer had only initialized it to `0px`
    // and never refreshed it. See Fix 3 in the bug report.
    const frontToast = toasts[0]
    const frontHeight = frontToast ? (heights.get(frontToast.id) ?? 0) : 0
    container.style.setProperty('--front-toast-height', `${frontHeight}px`)

    // Keep `data-lifted` in sync with the current `expanded` state.
    // See Fix 12. The container's `data-lifted` is read by the
    // `@media (hover: none) and (pointer: coarse) { [data-lifted='true']
    // { transform: none } }` rule to keep center-positioned toasters
    // visually centered while the user hovers them. It must only be
    // 'true' while the toaster is actually lifted (mouse enter/leave
    // flipped `expanded`). Touch devices never reach this state.
    setAttrs(container, { 'data-lifted': String(expanded) })

    // Index toasts by id for lookup.
    const existing = new Map<string, HTMLLIElement>()
    for (const child of Array.from(
      container.querySelectorAll<HTMLLIElement>('[data-notify-toast]')
    )) {
      const key = child.getAttribute('data-notify-key')
      if (key) existing.set(key, child)
    }

    // Update or create each toast.
    for (let index = 0; index < toasts.length; index += 1) {
      const toast = toasts[index]!
      const key = getToastKey(toast.id)
      const existingNode = existing.get(key)
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
        const newSnapshot = getContentSnapshot(toast, {
          closeButton: currentCloseButton,
          unstyled: currentUnstyled,
          invert: currentInvert,
          richColors: currentRichColors,
          closeButtonAriaLabel: currentCloseButtonAriaLabel
        })
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
          measureToastHeight(existingNode, toast.id)
          // Update the data-type and other top-level attributes.
          const type = toast.type ?? 'normal'
          const dismissible = toast.dismissible !== false
          const rich = toast.richColors ?? currentRichColors
          // Resolve against the toaster defaults so a
          // toaster.update({ invert: ... }) / ({ unstyled: ... })
          // re-applies on the next render. See Fix 15.
          const invert = Boolean(toast.invert) || currentInvert
          setAttrs(existingNode, {
            'data-type': type,
            'data-dismissible': String(dismissible),
            'data-rich-colors': String(rich),
            'data-invert': String(invert),
            'data-styled': String(!toast.unstyled && !currentUnstyled && !toast.custom),
            // Keep `data-promise` in sync with the toast's current
            // `promise` field. The legacy React build did this on
            // every render via JSX; the vanilla renderer must
            // replicate it explicitly because the data-* attributes
            // are set imperatively. See Fix 5 in the bug report.
            'data-promise': String(Boolean(toast.promise)),
            // a11y: re-emit `aria-busy` and `aria-label` so a
            // promise toast that settles (loading → success/error)
            // updates for screen readers too.
            'aria-busy': String(type === 'loading'),
            'aria-label': type === 'normal' ? undefined : `${type}: ${toast.title ?? ''}`
          })
          existingNode.className = cn(toast.className)
          if (toast.testId) existingNode.dataset['testid'] = toast.testId
          else existingNode.removeAttribute('data-testid')
          // Cache the new snapshot so the next render can compare.
          existingNode.dataset['snapshot'] = newSnapshot
          existingNode.dataset['type'] = type
          existingNode.dataset['dismissible'] = String(dismissible)
          // Reset the auto-dismiss timer (per contrato: "Reset si cambia
          // la duration"). The new duration might have changed too.
          // pauseAutoDismiss also returns the remaining time so
          // we can preserve the elapsed portion of the previous
          // timer if the new duration is the same as the old
          // (Fix: don't lose the elapsed time on snapshot-only
          // re-fills).
          const previousDuration = existingNode.dataset['duration']
          const previousRemaining = pauseAutoDismiss(toast.id)
          // See Fix 11 — `!toast.promise` was the wrong gate. The
          // type check is enough: a promise toast that has settled
          // to success/error flips its type away from 'loading' and
          // should now auto-dismiss.
          if ((toast.type ?? 'normal') !== 'loading') {
            const newDuration = toast.duration ?? currentDuration ?? TOAST_LIFETIME
            const durationChanged = previousDuration !== String(newDuration)
            const interaction = interactions.get(toast.id)
            if (interaction?.hovered || interaction?.focused) {
              if (durationChanged || interaction.remainingMs === null) {
                interaction.remainingMs = durationChanged ? newDuration : previousRemaining
              }
            } else if (newDuration !== Infinity) {
              startAutoDismiss(
                toast.id,
                durationChanged || previousRemaining <= 0 ? newDuration : previousRemaining
              )
            }
            existingNode.dataset['duration'] = String(newDuration)
          }
        }

        // Update index/front/visible/expanded/height data-attributes.
        const isFront = index === 0
        const isVisible = index + 1 <= currentVisibleToasts
        const offset = computeOffset(toasts, heights, index, currentGap)
        // Re-derive the position from the toaster's current
        // `currentPosition` (or the toast's per-toast override) so
        // that calling `toaster.update({ position: 'top-right' })`
        // re-positions the already-rendered toasts. The legacy React
        // build passed `position={currentPosition}` to every Toast
        // on every render, which made the same guarantee. See
        // Fix 13 in the bug report.
        const currentPos = getPositionForToast(toast)
        const [curY = 'bottom', curX = 'right'] = currentPos.split('-') as [string, string]
        const rich = toast.richColors ?? currentRichColors
        setAttrs(existingNode, {
          'data-index': String(index),
          'data-front': String(isFront),
          'data-visible': String(isVisible),
          // See Fix 13 in the create-path edit — `currentExpand`
          // applies to every toast, not just the front one.
          'data-expanded': String(Boolean(expanded || currentExpand)),
          'data-y-position': curY,
          'data-x-position': curX,
          'data-rich-colors': String(rich)
        })
        existingNode.style.setProperty('--index', String(index))
        existingNode.style.setProperty('--toasts-before', String(index))
        existingNode.style.setProperty('--z-index', String(1000 - index))
        existingNode.style.setProperty('--offset', `${offset}px`)
        existing.delete(key)
      }
    }

    // Anything left in `existing` is no longer in the active list —
    // but if it's a toast currently in its exit animation
    // (`data-removed='true'`), leave it alone: its own setTimeout from
    // the dismiss handler will remove the node after TIME_BEFORE_UNMOUNT
    // and then call `renderAll` so the stack gets re-indexed. Removing
    // it here would cut the exit transition short the moment a new
    // toast comes in. See Fix 6 in the bug report.
    for (const [, node] of existing) {
      if (node.getAttribute('data-removed') === 'true') continue
      const id = nodeIds.get(node)
      node.remove()
      if (id !== undefined) {
        heights.delete(id)
        cleanups.get(id)?.forEach((fn) => fn())
        cleanups.delete(id)
        interactions.delete(id)
        pauseAutoDismiss(id)
      }
    }
  }

  // --- Subscriber wiring -----------------------------------------------

  /**
   * Schedule a single point of cleanup for a dismissed `<li>`: the
   * CSS exit transition (transform + opacity, 400ms in the default
   * stylesheet) needs to finish before we rip the node out of the
   * DOM, otherwise the user sees the toast "teleport" off screen
   * instead of sliding out. The previous vanilla build used a
   * blanket `setTimeout(node.remove, TIME_BEFORE_UNMOUNT)` (200ms),
   * which truncated every exit animation at the halfway mark. Now we
   * wait for the actual `transitionend` event on the `transform`
   * property (the longest of the two animated properties, 400ms) —
   * with a generous timeout fallback in case the browser drops the
   * event (e.g. reduced-motion, interrupted transition, tab
   * backgrounded during the animation).
   *
   * `onRemove` is invoked at most once. Both the listener and the
   * fallback are cleared after the first firing to avoid a stray
   * late `transitionend` from re-running the cleanup.
   *
   * jsdom caveat: jsdom does not execute CSS transitions, so
   * `transitionend` never fires and `getComputedStyle(node).transitionDuration`
   * comes back as an empty string. We detect that case via the
   * `transitionDuration` read — when it's empty or `0s` we treat it
   * as "no transition" and fall back to `TIME_BEFORE_UNMOUNT`. That
   * keeps the existing jsdom-based vitest suite running without
   * changing what the tests assert, while real browsers (which do
   * return a real duration) wait for the full transition.
   */
  const schedulePostExitRemoval = (node: HTMLLIElement, onRemove: () => void): (() => void) => {
    let done = false
    let longestProperties = new Set<string>()
    // `fallback` is declared up-front so `finish` can `clearTimeout`
    // it from either branch (jsdom / reduced-motion vs real browser).
    // Without this, the jsdom branch's `setTimeout(finish, ...)` would
    // throw `ReferenceError: Cannot access 'fallback' before
    // initialization` when `finish` ran because the `const fallback =
    // ...` line in the real-browser branch hadn't executed yet
    // (temporal dead zone).
    let fallback: ReturnType<typeof setTimeout> | undefined
    const finish = (): void => {
      if (done) return
      done = true
      node.removeEventListener('transitionend', onTransitionEnd)
      if (fallback !== undefined) clearTimeout(fallback)
      onRemove()
    }
    const onTransitionEnd = (event: TransitionEvent): void => {
      // Ignore shorter properties such as opacity when transform is
      // still running. Only events fired by this node can finish cleanup.
      if (event.target !== node) return
      if (!longestProperties.has('all') && !longestProperties.has(event.propertyName)) return
      finish()
    }
    const cancel = (): void => {
      if (done) return
      done = true
      node.removeEventListener('transitionend', onTransitionEnd)
      if (fallback !== undefined) clearTimeout(fallback)
    }
    // Detect reduced motion and the "no transition" environment
    // (jsdom / non-CSS engine). The reduced-motion media query tells
    // us the user asked for no animation; a missing/zero
    // `transitionDuration` tells us the runtime can't run one.
    const isReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const computedStyle =
      typeof window !== 'undefined' && typeof window.getComputedStyle === 'function'
        ? window.getComputedStyle(node)
        : null
    const parseTimes = (value: string): number[] =>
      value.split(',').map((part) => {
        const match = part.trim().match(/^([\d.]+)(ms|s)$/)
        if (!match) return 0
        const n = Number(match[1])
        return match[2] === 's' ? n * 1000 : n
      })
    const durations = parseTimes(computedStyle?.transitionDuration ?? '')
    const delays = parseTimes(computedStyle?.transitionDelay ?? '')
    const properties = (computedStyle?.transitionProperty ?? '')
      .split(',')
      .map((property) => property.trim())
    const transitionCount = Math.max(durations.length, delays.length, properties.length)
    let longestMs = 0
    for (let index = 0; index < transitionCount; index += 1) {
      const duration = durations[index % durations.length] ?? 0
      const delay = delays[index % delays.length] ?? 0
      const total = duration + delay
      const property = properties[index % properties.length] ?? 'all'
      if (total > longestMs) {
        longestMs = total
        longestProperties = new Set([property])
      } else if (total === longestMs && total > 0) {
        longestProperties.add(property)
      }
    }
    // No real transition to wait for (jsdom, reduced-motion, or the
    // stylesheet didn't apply). Use the legacy `TIME_BEFORE_UNMOUNT`
    // so the existing jsdom tests keep working AND users with
    // reduced-motion don't see a frozen-frame before the node
    // disappears.
    if (isReducedMotion || longestMs === 0) {
      fallback = setTimeout(finish, TIME_BEFORE_UNMOUNT)
      return cancel
    }
    // Real browser with a real transition. Wait for `transitionend`
    // with a 100ms-larger-than-longest fallback (covers the worst
    // case where the browser drops the event).
    fallback = setTimeout(finish, longestMs + 100)
    node.addEventListener('transitionend', onTransitionEnd)
    return cancel
  }

  const unsubscribe = state.subscribe((event) => {
    if ('dismiss' in event && event.dismiss) {
      // Clear the auto-dismiss timer up-front so a second dismiss
      // source (the auto-dismiss timer firing after an external
      // `toast.dismiss(id)`) can't double-fire `onDismiss` or
      // re-schedule the DOM removal. The legacy React build
      // accomplished the same via the cleanup function of its
      // auto-dismiss `useEffect` — when `toast.delete` flipped to
      // `true` the deps changed and `return () => clearTimeout(...)`
      // ran. See Fix 9 in the bug report.
      pauseAutoDismiss(event.id)

      // Read the callback before scheduling removal so a same-id toast
      // recreated by the callback does not replace this reference.
      // close button, swipe-out, auto-dismiss timer, external
      // `toast.dismiss(id)`) so every dismiss path triggers the
      // callback exactly once. The legacy React build did the same
      // via the `useEffect(..., [toast.delete])` hook. See Fix 8 in
      // the bug report. We look up the toast before scheduling the
      // DOM removal because the removal timer fires after the exit
      // transition ends and the toast may already be evicted from
      // the active set by then.
      const dismissed = state.toasts.find((toast) => toast.id === event.id)

      // Mark the matching <li> as removed immediately so the CSS exit
      // animation runs; the DOM removal is scheduled for AFTER the
      // transition ends (see `schedulePostExitRemoval` above). All
      // dismiss sources (close button, auto-dismiss, swipe-out,
      // external `toast.dismiss(id)`) funnel through this subscriber
      // so we never schedule two removals for the same id. The
      // legacy `dismissToast()` and the swipe-out handler used to
      // each call `setTimeout(node.remove, TIME_BEFORE_UNMOUNT)` —
      // those branches were removed; the cleanup happens here, and
      // only here.
      const node = container.querySelector<HTMLLIElement>(
        `[data-notify-toast][data-notify-key="${cssEscape(getToastKey(event.id))}"]`
      )
      if (node) {
        setAttrs(node, { 'data-removed': 'true' })
        const cancelExit = schedulePostExitRemoval(node, () => {
          exitCleanups.delete(event.id)
          node.remove()
          heights.delete(event.id)
          cleanups.get(event.id)?.forEach((fn) => fn())
          cleanups.delete(event.id)
          interactions.delete(event.id)
          // After the dismissed <li> is gone, re-render so the remaining
          // toasts get fresh `data-index` / `data-front` / `data-visible`
          // attributes. Without this they stay stuck with the indices
          // they had before the dismiss (Fix 4 in the bug report).
          renderAll()
        })
        exitCleanups.set(event.id, cancelExit)
      } else {
        // No matching DOM node — just ensure renderAll doesn't recreate it.
        window.setTimeout(renderAll, 0)
      }
      dismissed?.onDismiss?.(dismissed)
      return
    }
    const cancelExit = exitCleanups.get(event.id)
    if (cancelExit) {
      cancelExit()
      exitCleanups.delete(event.id)
      const node = container.querySelector<HTMLLIElement>(
        `[data-notify-toast][data-notify-key="${cssEscape(getToastKey(event.id))}"]`
      )
      if (node) {
        setAttrs(node, {
          'data-removed': 'false',
          'data-swipe-out': 'false',
          'data-swiping': 'false'
        })
      }
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
        if (next.gap !== undefined) currentGap = next.gap
        if (next.expand !== undefined) currentExpand = next.expand
        if (next.position !== undefined) {
          currentPosition = next.position
          const [y = 'bottom', x = 'right'] = currentPosition.split('-') as [string, string]
          setAttrs(container, { 'data-y-position': y, 'data-x-position': x })
        }
        if (next.theme !== undefined) {
          currentThemePreference = next.theme
          syncThemeSubscription()
        }
        if (next.richColors !== undefined) {
          currentRichColors = next.richColors
          setAttrs(container, { 'data-rich-colors': String(currentRichColors) })
        }
        if (next.dir !== undefined) {
          currentDir = next.dir
          setAttrs(container, { dir: currentDir === 'auto' ? getDocumentDirection() : currentDir })
        }
        // Restored option (Fix 15). Restored `invert` / `unstyled` /
        // `closeButtonAriaLabel` / `style` re-application so a
        // toaster.update(...) actually changes the visuals.
        if (next.invert !== undefined) currentInvert = next.invert
        if (next.unstyled !== undefined) currentUnstyled = next.unstyled
        if (next.closeButtonAriaLabel !== undefined) {
          currentCloseButtonAriaLabel = next.closeButtonAriaLabel
        }
        if (next.style !== undefined) currentStyle = next.style
        if (next.hotkey !== undefined) currentHotkey = next.hotkey
        if (next.className !== undefined) container.className = next.className
        if (next.customAriaLabel !== undefined || next.containerAriaLabel !== undefined) {
          setAttrs(container, {
            'aria-label':
              currentOptions.customAriaLabel ?? currentOptions.containerAriaLabel ?? 'Notifications'
          })
        }
        applyContainerStyles(container, {
          offset: currentOptions.offset,
          mobileOffset: currentOptions.mobileOffset,
          gap: currentGap,
          width: TOAST_WIDTH,
          style: currentStyle
        })
      }
      renderAll()
      if (next?.duration !== undefined || next?.id !== undefined) {
        restartAllTimers()
      }
      return controller
    },
    destroy: () => {
      // Clear all timers and cleanups.
      for (const record of timers.values()) clearTimeout(record.handle)
      timers.clear()
      for (const cleanupsForToast of cleanups.values()) {
        for (const fn of cleanupsForToast) fn()
      }
      cleanups.clear()
      interactions.clear()
      for (const cancelExit of exitCleanups.values()) cancelExit()
      exitCleanups.clear()
      for (const fn of removeListeners) fn()
      removeListeners.length = 0
      // a11y: restore focus to whatever the user had focused before
      // the toaster mounted (the legacy sonner behaviour). Only
      // restore if the active element is still the container or
      // a child of it — otherwise the user has moved focus
      // somewhere else and we shouldn't yank it back. Skip when
      // there's nothing to restore to.
      if (
        lastFocusedElementBeforeMount &&
        document.activeElement &&
        container.contains(document.activeElement)
      ) {
        try {
          lastFocusedElementBeforeMount.focus({ preventScroll: true })
        } catch {
          // Some elements (e.g. detached inputs) throw on focus().
          // Best-effort restoration; ignore failures.
        }
      }
      container.remove()
    }
  }

  return controller
}

// --- Internal helpers ----------------------------------------------------

const applyContainerStyles = (
  container: HTMLElement,
  opts: {
    offset?: ToasterOptions['offset']
    mobileOffset?: ToasterOptions['mobileOffset']
    gap: number
    width: number
    style?: ToasterOptions['style']
  }
): void => {
  const styles = assignOffset(opts.offset, opts.mobileOffset)
  for (const [key, value] of Object.entries(styles)) {
    container.style.setProperty(key, value)
  }
  // Spread consumer-supplied CSS custom properties (e.g. `--width`,
  // `--normal-bg`) onto the container so themes can pin their own
  // design tokens. Restored from the legacy React build's
  // `style` prop — see Fix 15.
  if (opts.style) {
    for (const [key, value] of Object.entries(opts.style)) {
      container.style.setProperty(key, value)
    }
  }
  container.style.setProperty('--width', `${opts.width}px`)
  container.style.setProperty('--gap', `${opts.gap}px`)
  container.style.setProperty('--front-toast-height', '0px')
}

const computeOffset = (
  toasts: ToastT[],
  heights: Map<ToastT['id'], number>,
  index: number,
  gap: number
): number => {
  let offset = 0
  for (let i = 0; i < index; i += 1) {
    const h = heights.get(toasts[i]?.id ?? -1) ?? 0
    offset += h
  }
  // Add `index * gap` so the expanded stack actually has visible space
  // between each toast. The legacy React build did this on every render
  // (`offset.current = heightIndex * gap + toastsHeightBefore`); the
  // previous vanilla refactor dropped the `* gap` term, so the
  // expanded stack collapsed to its real height (toasts sitting
  // directly on top of each other with no breathing room). The visual
  // gap also matches the `:after` pseudo-element on each expanded
  // toast (`height: calc(var(--gap) + 1px)`), which exists to extend
  // the hover hit area between toasts.
  return offset + index * gap
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
 * Function and object references receive stable weak IDs so replacing a
 * callback or custom element triggers a re-fill without retaining it.
 */
const getContentSnapshot = (
  toast: ToastT,
  defaults: {
    closeButton: boolean
    unstyled: boolean
    invert: boolean
    richColors: boolean
    closeButtonAriaLabel: string
  }
): string => {
  const resolvedCloseButton = toast.closeButton ?? defaults.closeButton
  // See Fix 18 — resolve toaster-wide defaults into the snapshot so
  // a `toaster.update({ unstyled, invert, richColors,
  // closeButtonAriaLabel, closeButton })` actually mutates the
  // rendered DOM on every existing toast (not just toasts that pin
  // their own values). Without these, the snapshot would be stable
  // across toaster-level changes and the update path would skip
  // the re-fill that updates data-styled, data-invert, the close
  // button's aria-label, and the close button's existence.
  const resolvedUnstyled = toast.unstyled ?? defaults.unstyled
  const resolvedInvert = toast.invert ?? defaults.invert
  const resolvedRichColors = toast.richColors ?? defaults.richColors
  return JSON.stringify({
    type: toast.type ?? 'normal',
    title: normalizeForSnapshot(toast.title),
    description: normalizeForSnapshot(toast.description),
    action: toast.action
      ? {
          label: normalizeForSnapshot(toast.action.label as RenderableOrFactory),
          closeOnClick: toast.action.closeOnClick,
          onClick: normalizeForSnapshot(toast.action.onClick)
        }
      : null,
    cancel: toast.cancel
      ? {
          label: normalizeForSnapshot(toast.cancel.label as RenderableOrFactory),
          closeOnClick: toast.cancel.closeOnClick,
          onClick: normalizeForSnapshot(toast.cancel.onClick)
        }
      : null,
    custom: normalizeForSnapshot(toast.custom),
    onClick: normalizeForSnapshot(toast.onClick),
    duration: toast.duration,
    position: toast.position,
    className: toast.className,
    descriptionClassName: toast.descriptionClassName,
    testId: toast.testId,
    // See Fix 14 — resolve against the toaster-wide defaults so
    // a toaster.update({ closeButton: ... }) flips the snapshot
    // for every toast that doesn't pin its own value.
    closeButton: resolvedCloseButton,
    closeButtonAriaLabel: resolvedCloseButton ? defaults.closeButtonAriaLabel : null,
    // Fix 18: also include the resolved unstyled / invert /
    // rich-colors in the snapshot so the update path re-fills
    // and re-emits data-styled / data-invert / data-rich-colors
    // on every existing toast when the toaster defaults change.
    unstyled: resolvedUnstyled,
    invert: resolvedInvert,
    richColors: resolvedRichColors,
    dismissible: toast.dismissible
  })
}

const snapshotReferences = new WeakMap<object, number>()
let snapshotReferenceCounter = 0

const normalizeForSnapshot = (value: unknown): unknown => {
  if (value === null || value === undefined || value === false) return null
  if (typeof value === 'function' || typeof value === 'object') {
    const reference = value as object
    let id = snapshotReferences.get(reference)
    if (id === undefined) {
      id = ++snapshotReferenceCounter
      snapshotReferences.set(reference, id)
    }
    return `ref:${id}`
  }
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

function getToastKey(id: ToastT['id']): string {
  return `${typeof id === 'number' ? 'number' : 'string'}:${id}`
}
