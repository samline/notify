// Shared mutable state for the toast runtime.
//
// Mirrors the legacy `state.ts` Observer pattern: a single module-level
// instance buffers toasts, dispatches updates to subscribers, and tracks
// which ids have been dismissed so the renderer can clean them up.
//
// The major difference from the React-flavored original:
//   - `Renderable` replaces `ReactNode` for titles/descriptions/messages.
//   - `custom()` accepts an `HTMLElement` or `(container) => void`
//     callback instead of a JSX-returning function.
//   - No `React.isValidElement` checks anywhere.

import type {
  CustomContent,
  PromiseData,
  PromiseInput,
  PromiseValue,
  Renderable,
  RenderableOrFactory,
  ToastId,
  ToastOptions,
  ToastT,
  ToastToDismiss
} from './types'

let toastsCounter = 1

type TitleInput = RenderableOrFactory

export interface ToastInput extends Omit<ToastOptions, 'description'> {
  message?: TitleInput
  description?: TitleInput
  custom?: CustomContent
  /**
   * Internal: set by `toast.promise()` so the renderer can attach
   * `data-promise='true'` to the <li>. Not part of the public
   * `ToastOptions` — `toast.promise()` is the only entrypoint.
   */
  promise?: PromiseInput<unknown>
}

export type ToastSubscriber = (toast: ToastT | ToastToDismiss) => void

class Observer {
  subscribers: ToastSubscriber[] = []
  toasts: ToastT[] = []
  dismissedToasts: Set<ToastId> = new Set()

  subscribe = (subscriber: ToastSubscriber): (() => void) => {
    this.subscribers.push(subscriber)
    return () => {
      const index = this.subscribers.indexOf(subscriber)
      if (index >= 0) this.subscribers.splice(index, 1)
    }
  }

  publish = (data: ToastT | ToastToDismiss): void => {
    for (const subscriber of this.subscribers) subscriber(data)
  }

  addToast = (data: ToastT): void => {
    // Newest at the front (index 0 = `data-front='true'`). The renderer
    // and CSS rely on index 0 being the most recently added toast — see
    // Fix 2 in the bug report. Appending (the previous behavior) made
    // the OLDEST toast the "front" one, which is backwards from the
    // legacy React/sonner contract where the newest toast is the one
    // the user just triggered.
    this.toasts = [data, ...this.toasts]
    this.publish(data)
  }

  create = (data: ToastInput): ToastId => {
    const { message, custom, description, ...rest } = data
    let id: ToastId
    if (typeof data.id === 'number' || (typeof data.id === 'string' && data.id.length > 0)) {
      id = data.id
    } else {
      do {
        id = toastsCounter++
      } while (this.toasts.some((toast) => toast.id === id))
    }

    const dismissible = data.dismissible === undefined ? true : data.dismissible
    const title = typeof message === 'function' ? message() : message
    const descriptionRenderable: Renderable | undefined =
      typeof description === 'function' ? description() : description

    if (this.dismissedToasts.has(id)) {
      this.dismissedToasts.delete(id)
    }

    const existingIndex = this.toasts.findIndex((toast) => toast.id === id)

    if (existingIndex >= 0) {
      const existing = this.toasts[existingIndex]
      if (!existing) return id
      const merged: ToastT = {
        ...existing,
        ...rest,
        id,
        dismissible,
        title,
        ...(descriptionRenderable !== undefined ? { description: descriptionRenderable } : {}),
        ...(custom !== undefined ? { custom } : {})
      }
      this.toasts = this.toasts.map((toast, index) => (index === existingIndex ? merged : toast))
      this.publish(merged)
      return id
    }

    const next: ToastT = {
      ...rest,
      id,
      dismissible,
      title,
      ...(descriptionRenderable !== undefined ? { description: descriptionRenderable } : {}),
      ...(custom !== undefined ? { custom } : {})
    }
    this.addToast(next)
    return id
  }

  dismiss = (id?: ToastId): ToastId | undefined => {
    if (id !== undefined) {
      // Guard against double-dismiss: a second call would
      // re-publish the dismiss event and the renderer subscriber
      // would re-invoke `toast.onDismiss`, schedule a second
      // DOM-removal setTimeout, etc. The legacy React build had
      // the same edge case; we de-duplicate here. See Fix 16.
      if (this.dismissedToasts.has(id)) return id
      this.dismissedToasts.add(id)
      this.publish({ id, dismiss: true })
    } else {
      for (const toast of this.toasts) {
        if (this.dismissedToasts.has(toast.id)) continue
        this.dismissedToasts.add(toast.id)
        this.publish({ id: toast.id, dismiss: true })
      }
    }
    return id
  }

  message = (message: TitleInput, data?: ToastOptions): ToastId =>
    this.create({ ...(data ?? {}), message })

  error = (message: TitleInput, data?: ToastOptions): ToastId =>
    this.create({ ...(data ?? {}), message, type: 'error' })

  success = (message: TitleInput, data?: ToastOptions): ToastId =>
    this.create({ ...(data ?? {}), type: 'success', message })

  info = (message: TitleInput, data?: ToastOptions): ToastId =>
    this.create({ ...(data ?? {}), type: 'info', message })

  warning = (message: TitleInput, data?: ToastOptions): ToastId =>
    this.create({ ...(data ?? {}), type: 'warning', message })

  loading = (message: TitleInput, data?: ToastOptions): ToastId =>
    this.create({ ...(data ?? {}), type: 'loading', message })

  promise = <ToastData>(
    promise: PromiseInput<ToastData>,
    data?: PromiseData<ToastData>
  ):
    | { id: ToastId; unwrap: () => Promise<ToastData> }
    | { id?: undefined; unwrap: () => Promise<ToastData> } => {
    const resolveInput = (): Promise<ToastData> => {
      if (typeof promise !== 'function') return Promise.resolve(promise)
      try {
        return Promise.resolve((promise as () => Promise<ToastData>)())
      } catch (error) {
        return Promise.reject(error)
      }
    }

    if (!data) {
      // Nothing to render, but still return a passthrough unwrap.
      return {
        unwrap: resolveInput
      }
    }

    let id: ToastId | undefined
    if (data.loading !== undefined) {
      const description = typeof data.description === 'function' ? undefined : data.description
      const { description: _droppedDesc, ...rest } = data
      void _droppedDesc
      const loadingPayload: ToastInput = {
        // `promise` is part of `ToastT`; the renderer reads `toast.promise`
        // to set `data-promise='true'` on the <li> and trigger the
        // `[data-promise='true'] [data-icon] > svg` fade-in animation
        // defined in `styles.css`. The legacy React build also included
        // `promise` here. Without it the animation never plays (see
        // Fix 5 in the bug report).
        ...rest,
        promise,
        type: 'loading',
        message: data.loading,
        ...(description !== undefined ? { description } : {})
      }
      id = this.create(loadingPayload)
    }

    const resolved = resolveInput()

    const state: { result: ['resolve', ToastData] | ['reject', unknown] | null } = { result: null }

    const handleValue = async <K extends 'success' | 'error'>(
      value: PromiseValue<unknown> | undefined,
      type: K
    ): Promise<void> => {
      if (value === undefined) return
      const errorInfo = state.result?.[1]
      const resolvedValue =
        typeof value === 'function'
          ? await (value as (data: unknown) => unknown)(errorInfo ?? null)
          : value

      // Fix 17: the `PromiseData.description` field accepts a function
      // form (`(data) => Renderable`) but the vanilla renderer never
      // invoked it. The legacy React build called the function for
      // HTTP errors and passed a hardcoded error string. We pass the
      // error info (the rejected value of the promise — the Response
      // for HTTP errors, the Error object for other rejections) so
      // the user can introspect it. Only invoked on `error`; for
      // `success` the static value (if any) is used, matching the
      // legacy contract. The `await` allows async descriptions
      // (e.g. one that re-fetches the failure body).
      const descFn =
        typeof data.description === 'function'
          ? (data.description as (data: unknown) => Renderable | Promise<Renderable>)
          : null
      const descStatic = descFn === null ? (data.description as Renderable | undefined) : undefined
      let resolvedDescription: Renderable | undefined
      if (type === 'error' && descFn) {
        resolvedDescription = await descFn(errorInfo ?? null)
      } else if (descStatic !== undefined) {
        resolvedDescription = descStatic
      }
      // success path + function form: no description (matches legacy).

      if (isExtendedResult(resolvedValue)) {
        const { message: extendedMessage, ...rest } = resolvedValue
        const payload: ToastInput = {
          ...(id !== undefined ? { id } : {}),
          type,
          ...rest,
          ...(extendedMessage !== undefined ? { message: extendedMessage } : {}),
          ...(resolvedDescription !== undefined ? { description: resolvedDescription } : {})
        }
        this.create(payload)
        return
      }
      const payload: ToastInput = {
        ...(id !== undefined ? { id } : {}),
        type,
        message: resolvedValue as Renderable,
        ...(resolvedDescription !== undefined ? { description: resolvedDescription } : {})
      }
      this.create(payload)
    }

    const outcome = resolved.then(
      (value) => ({ status: 'fulfilled' as const, value }),
      (reason: unknown) => ({ status: 'rejected' as const, reason })
    )
    const rendering = outcome
      .then(async (result) => {
        if (result.status === 'rejected') {
          state.result = ['reject', result.reason]
          await handleValue(data.error, 'error')
          return
        }
        state.result = ['resolve', result.value]
        if (isHttpResponse(result.value) && !result.value.ok) {
          await handleValue(data.error, 'error')
        } else if (result.value instanceof Error) {
          await handleValue(data.error, 'error')
        } else {
          await handleValue(data.success as PromiseValue<unknown> | undefined, 'success')
        }
      })
      .finally(async () => {
        await data.finally?.()
      })
    const renderingHandled = rendering.catch(() => undefined)

    const unwrap = async (): Promise<ToastData> => {
      const result = await outcome
      // Rendering callbacks must not change the original promise outcome.
      await renderingHandled
      if (result.status === 'rejected') throw result.reason
      return result.value
    }

    if (id === undefined) {
      return { unwrap }
    }

    return { id, unwrap }
  }

  custom = (content: CustomContent, data?: ToastOptions): ToastId => {
    const id: ToastId = data?.id ?? toastsCounter++
    this.create({ ...(data ?? {}), custom: content, id })
    return id
  }

  getActiveToasts = (): ToastT[] =>
    this.toasts.filter((toast) => !this.dismissedToasts.has(toast.id))

  getHistory = (): ToastT[] => this.toasts

  getToasts = (): ToastT[] => this.getActiveToasts()
}

const isHttpResponse = (value: unknown): value is Response =>
  typeof value === 'object' &&
  value !== null &&
  'ok' in value &&
  typeof (value as { ok: unknown }).ok === 'boolean' &&
  'status' in value &&
  typeof (value as { status: unknown }).status === 'number'

const isExtendedResult = (value: unknown): value is { message: Renderable } & ToastOptions =>
  typeof value === 'object' && value !== null && 'message' in value && !Array.isArray(value)

export const ToastState = new Observer()

const toastFunction = (message: TitleInput, data?: ToastOptions): ToastId =>
  ToastState.create({ ...(data ?? {}), message })

export const toast = Object.assign(toastFunction, {
  success: ToastState.success,
  info: ToastState.info,
  warning: ToastState.warning,
  error: ToastState.error,
  custom: ToastState.custom,
  message: ToastState.message,
  promise: ToastState.promise,
  dismiss: ToastState.dismiss,
  loading: ToastState.loading,
  getHistory: () => ToastState.toasts,
  getToasts: () => ToastState.getActiveToasts()
})

/**
 * Reset the singleton — used by tests and `resetToasts()` to ensure
 * each scenario starts from a clean counter and empty queues.
 */
export function resetToastState(): void {
  ToastState.subscribers = []
  ToastState.toasts = []
  ToastState.dismissedToasts = new Set()
  toastsCounter = 1
}
