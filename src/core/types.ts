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
  closeButton?: boolean
  dismissible?: boolean
  duration?: number
  className?: string
  descriptionClassName?: string
  action?: ToastAction
  cancel?: ToastAction
  testId?: string
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
  customAriaLabel?: string
  containerAriaLabel?: string
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
