// Main vanilla entrypoint. Public surface exposed to `@samline/notify`.
//
// The package is **side-effect free** at the root entrypoint
// (`"sideEffects": false` in package.json). Consumers who want
// `window.Notify` should import `@samline/notify/browser` instead.

export { toast } from './api/toast'
export type { ToastApi } from './api/toast'

export { createToaster } from './api/create-toaster'
export { createToaster as Toaster } from './api/create-toaster'
export { destroyToaster } from './api/destroy-toaster'
export { getToaster } from './api/get-toaster'
export { configureToaster } from './api/configure-toaster'
export { resetToasts } from './api/reset-toasts'

export { browser } from './browser/registry'
export type { NotifyApi } from './browser/registry'

// Public types
export type {
  CustomContent,
  Direction,
  Offset,
  Position,
  PromiseData,
  PromiseExtendedResult,
  PromiseInput,
  PromiseValue,
  Renderable,
  SwipeDirection,
  Theme,
  ToastAction,
  ToastId,
  ToastOptions,
  ToastT,
  ToastType,
  ToasterController,
  ToasterOptions
} from './core/types'

// Re-export the internal state for tests and advanced consumers
// (advanced use only — most callers should stick to `toast.*`).
export { ToastState, resetToastState, mountToaster } from './core'
export type { ToastInput, ToastSubscriber } from './core'

// Numeric constants for consumers who want to reason about timing
// without re-deriving values.
export {
  GAP,
  MOBILE_VIEWPORT_OFFSET,
  SWIPE_THRESHOLD,
  TIME_BEFORE_UNMOUNT,
  TOAST_LIFETIME,
  TOAST_WIDTH,
  VIEWPORT_OFFSET,
  VISIBLE_TOASTS_AMOUNT
} from './core/constants'
