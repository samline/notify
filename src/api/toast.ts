// Public toast factory and its variants.
//
// `toast(message, options?)` is the canonical entrypoint. All variants
// (`success`, `error`, `info`, `warning`, `loading`, `message`, `promise`,
// `dismiss`, `getHistory`, `getToasts`) hang off the same `toast`
// function via `Object.assign`, matching the original API shape but
// without React internals.

import { ToastState } from '../core/state'
import type { Renderable, ToastId, ToastOptions, ToastT } from '../core/types'

/**
 * The main toast factory. Returns a `ToastId` you can pass to
 * `toast.dismiss()` to remove a specific toast early.
 */
const toastFunction = (message: Renderable, options?: ToastOptions): ToastId =>
  ToastState.create({ ...(options ?? {}), message })

export interface ToastApi {
  (message: Renderable, options?: ToastOptions): ToastId
  success: (message: Renderable, options?: ToastOptions) => ToastId
  error: (message: Renderable, options?: ToastOptions) => ToastId
  info: (message: Renderable, options?: ToastOptions) => ToastId
  warning: (message: Renderable, options?: ToastOptions) => ToastId
  loading: (message: Renderable, options?: ToastOptions) => ToastId
  message: (message: Renderable, options?: ToastOptions) => ToastId
  custom: typeof ToastState.custom
  promise: typeof ToastState.promise
  dismiss: (id?: ToastId) => ToastId | undefined
  getHistory: () => ToastT[]
  getToasts: () => ToastT[]
}

export const toast: ToastApi = Object.assign(toastFunction, {
  success: ToastState.success,
  error: ToastState.error,
  info: ToastState.info,
  warning: ToastState.warning,
  loading: ToastState.loading,
  message: ToastState.message,
  custom: ToastState.custom,
  promise: ToastState.promise,
  dismiss: ToastState.dismiss,
  getHistory: () => ToastState.toasts,
  getToasts: () => ToastState.getActiveToasts()
})
