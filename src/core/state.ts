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
    this.toasts = [...this.toasts, data]
    this.publish(data)
  }

  create = (data: ToastInput): ToastId => {
    const { message, custom, description, ...rest } = data
    const id: ToastId =
      typeof data.id === 'number' || (typeof data.id === 'string' && data.id.length > 0)
        ? data.id
        : toastsCounter++

    const dismissible = data.dismissible === undefined ? true : data.dismissible
    const title = typeof message === 'function' ? message() : message
    // `description` on the input is `TitleInput` (function allowed), but
    // `ToastT.description` is `Renderable` (function NOT allowed) — the
    // renderer does not call description as a function. We only persist
    // the description if it's not a function.
    const descriptionRenderable: Renderable | undefined =
      typeof description === 'function' ? undefined : description

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
      this.dismissedToasts.add(id)
      this.publish({ id, dismiss: true })
    } else {
      for (const toast of this.toasts) {
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
  ): { id: ToastId; unwrap: () => Promise<ToastData> } | { id?: undefined; unwrap: () => Promise<ToastData> } => {
    if (!data) {
      // Nothing to render, but still return a passthrough unwrap.
      return {
        unwrap: () =>
          Promise.resolve(typeof promise === 'function' ? (promise as () => Promise<ToastData>)() : promise)
      }
    }

    let id: ToastId | undefined
    if (data.loading !== undefined) {
      const description =
        typeof data.description === 'function' ? undefined : data.description
      const { description: _droppedDesc, ...rest } = data
      void _droppedDesc
      const loadingPayload: ToastInput = {
        ...rest,
        type: 'loading',
        message: data.loading,
        ...(description !== undefined ? { description } : {})
      }
      id = this.create(loadingPayload)
    }

    const resolved = Promise.resolve(
      typeof promise === 'function' ? (promise as () => Promise<ToastData>)() : promise
    )

    const state: { result: ['resolve', ToastData] | ['reject', unknown] | null } = { result: null }

    const handleValue = async <K extends 'success' | 'error'>(
      value: PromiseValue<unknown> | undefined,
      type: K
    ): Promise<void> => {
      if (value === undefined) return
      const resolvedValue =
        typeof value === 'function' ? await (value as (data: unknown) => unknown)(state.result?.[1] ?? null) : value
      if (isExtendedResult(resolvedValue)) {
        const { message: extendedMessage, ...rest } = resolvedValue
        const payload: ToastInput = {
          ...(id !== undefined ? { id } : {}),
          type,
          ...rest,
          ...(extendedMessage !== undefined ? { message: extendedMessage } : {})
        }
        this.create(payload)
        return
      }
      const payload: ToastInput = {
        ...(id !== undefined ? { id } : {}),
        type,
        message: resolvedValue as Renderable
      }
      this.create(payload)
    }

    const originalPromise = resolved
      .then(async (response) => {
        state.result = ['resolve', response]
        if (isHttpResponse(response) && !response.ok) {
          await handleValue(data.error, 'error')
        } else if (response instanceof Error) {
          await handleValue(data.error, 'error')
        } else {
          await handleValue(data.success as PromiseValue<unknown> | undefined, 'success')
        }
      })
      .catch(async (error) => {
        state.result = ['reject', error]
        await handleValue(data.error, 'error')
      })
      .finally(() => {
        data.finally?.()
      })

    const unwrap = () =>
      new Promise<ToastData>((resolve, reject) => {
        originalPromise
          .then(() => {
            if (state.result && state.result[0] === 'reject') {
              reject(state.result[1])
            } else if (state.result) {
              resolve(state.result[1])
            } else {
              resolve(undefined as unknown as ToastData)
            }
          })
          .catch(reject)
      })

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

  getActiveToasts = (): ToastT[] => this.toasts.filter((toast) => !this.dismissedToasts.has(toast.id))

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
