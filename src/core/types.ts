// Public types for `@samline/notify`.
// Keep this file focused on shape only — no runtime logic.

export type ToastId = number | string

export type ToastType =
  | 'normal'
  | 'action'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'loading'
  | 'default'

/**
 * Anything that can be safely rendered as text inside a toast.
 *
 * - `string` / `number` — rendered as textContent.
 * - `boolean` — `true` renders as "true", `false`/`null`/`undefined` renders as nothing.
 * - `HTMLElement` / callback — for `custom()` rich content; the renderer mounts it.
 *
 * No JSX, no `ReactNode` — this is the vanilla/browser contract.
 */
export type Renderable = string | number | boolean | null | undefined

/**
 * Like `Renderable` but also accepts a callback that returns a `Renderable`.
 * Useful for lazy titles / descriptions (e.g. formatters that depend on
 * current locale).
 */
export type RenderableOrFactory = Renderable | (() => Renderable)

/**
 * Rich content for `toast.custom()`. Pass either an `HTMLElement` you own or
 * a callback that fills a container. The renderer will mount it directly.
 */
export type CustomContent = HTMLElement | ((container: HTMLElement) => void)

export interface ToastAction {
  label: Renderable
  onClick?: (event: Event) => void
  closeOnClick?: boolean
}

export interface ToastOptions {
  id?: ToastId
  toasterId?: string
  description?: RenderableOrFactory
  type?: ToastType
  richColors?: boolean
  invert?: boolean
  unstyled?: boolean
  closeButton?: boolean
  dismissible?: boolean
  duration?: number
  className?: string
  descriptionClassName?: string
  action?: ToastAction
  cancel?: ToastAction
  testId?: string
  /**
   * Fires when the toast is dismissed by ANY path (close button,
   * swipe-out, auto-dismiss timer, external `toast.dismiss(id)`).
   * Mirrors the legacy React `onDismiss` contract. The vanilla
   * refactor omitted this from the public `ToastOptions` shape;
   * the renderer already supports it, so we re-expose it (see
   * Fix 8 in the bug report).
   */
  onDismiss?: (toast: ToastT) => void
  /**
   * Fires when the auto-dismiss timer expires (only — not for
   * user-initiated dismisses). Mirrors the legacy React
   * `onAutoClose` contract.
   */
  onAutoClose?: (toast: ToastT) => void
  /**
   * Fires when the user clicks the toast body (NOT the close,
   * action, or cancel buttons). Mirrors the legacy React
   * `onClick` contract; the vanilla refactor dropped the click
   * handler entirely. Skipped while the toast is in `loading`
   * state (use the promise `success` / `error` callbacks for
   * async work instead).
   */
  onClick?: (event: Event) => void
}

export type Position =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'top-center'
  | 'bottom-center'

export type Theme = 'light' | 'dark' | 'system'
export type Direction = 'rtl' | 'ltr' | 'auto'

export type SwipeDirection = 'top' | 'right' | 'bottom' | 'left'

export type Offset =
  | number
  | string
  | {
      top?: number | string
      right?: number | string
      bottom?: number | string
      left?: number | string
    }

export interface ToasterOptions {
  id?: string
  theme?: Theme
  position?: Position
  expand?: boolean
  duration?: number
  gap?: number
  visibleToasts?: number
  closeButton?: boolean
  className?: string
  offset?: Offset
  mobileOffset?: Offset
  dir?: Direction
  richColors?: boolean
  invert?: boolean
  unstyled?: boolean
  customAriaLabel?: string
  containerAriaLabel?: string
  closeButtonAriaLabel?: string
  /**
   * Extra CSS custom properties spread onto the `<ol>` container.
   * Lets consumers pin their own design tokens (e.g. `'--normal-bg'`,
   * `'--width'`) without subclassing. Legacy React build accepted
   * this as a `CSSProperties` object; the vanilla refactor dropped
   * it. Restored as a plain `Record<string, string>` to keep the
   * runtime dependency-free.
   */
  style?: Record<string, string>
  /**
   * a11y: keyboard shortcut to focus the toaster. Each entry is
   * matched against the `KeyboardEvent` (modifier keys are checked
   * by name — `altKey`, `metaKey`, `ctrlKey`, `shiftKey` — and
   * everything else is matched against `KeyboardEvent.code` like
   * `KeyT`, `KeyK`, `Slash`, `Enter`, etc.). Pass `[]` to disable
   * the hotkey entirely. Default: `['altKey', 'KeyT']` (alt+T) to
   * match the legacy sonner default. The hotkey is ignored when
   * the user is typing in an `INPUT` / `TEXTAREA` / `SELECT` or
   * any element with `contenteditable=true`.
   */
  hotkey?: string[]
}

export interface ToasterController {
  element: HTMLElement
  options: ToasterOptions
  update: (options?: ToasterOptions) => ToasterController
  destroy: () => void
}

/**
 * Internal representation of a toast. The renderer subscribes to the
 * `Observer` and re-renders the DOM whenever this shape changes.
 */
export interface ToastT {
  id: ToastId
  toasterId?: string
  title?: RenderableOrFactory
  description?: RenderableOrFactory
  type?: ToastType
  richColors?: boolean
  invert?: boolean
  unstyled?: boolean
  closeButton?: boolean
  dismissible?: boolean
  duration?: number
  className?: string
  descriptionClassName?: string
  position?: Position
  testId?: string
  action?: ToastAction
  cancel?: ToastAction
  custom?: CustomContent
  promise?: PromiseInput<unknown>
  delete?: boolean
  onDismiss?: (toast: ToastT) => void
  onAutoClose?: (toast: ToastT) => void
  onClick?: (event: Event) => void
}

export interface ToastToDismiss {
  id: ToastId
  dismiss: boolean
}

/**
 * Promise helper payload. Each `success`/`error` value can be:
 * - a `Renderable` (rendered directly)
 * - a `PromiseExtendedResult` (a partial `ToastOptions` with `message`)
 * - a callback returning either of the above
 */
export interface PromiseExtendedResult extends ToastOptions {
  message: Renderable
}

export type PromiseValue<Data = unknown> =
  | Renderable
  | PromiseExtendedResult
  | ((
      data: Data
    ) => Renderable | PromiseExtendedResult | Promise<Renderable | PromiseExtendedResult>)

export type PromiseInput<ToastData = unknown> = Promise<ToastData> | (() => Promise<ToastData>)

export interface PromiseData<ToastData = unknown> extends Omit<ToastOptions, 'description'> {
  loading?: Renderable
  success?: PromiseValue<ToastData>
  error?: PromiseValue
  description?: Renderable | ((data: ToastData | unknown) => Renderable | Promise<Renderable>)
  finally?: () => void | Promise<void>
}
