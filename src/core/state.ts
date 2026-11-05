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

/** Maximum number of dismissed records kept for `toast.getHistory()`. */
export const HISTORY_LIMIT = 50
let resetEpoch = 0

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
    const errors: unknown[] = []
    for (const subscriber of [...this.subscribers]) {
      if (!this.subscribers.includes(subscriber)) continue
      try {
        subscriber(data)
      } catch (error) {
        errors.push(error)
      }
    }
    if (errors.length) throw errors[0]
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

  create = (data: ToastInput): ToastId => this.createRecord(data).id

  private createRecord = (data: ToastInput): { id: ToastId; record: ToastT } => {
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
      if (!existing) throw new Error('Toast record disappeared during creation')
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
      return { id, record: merged }
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
    return { id, record: next }
  }

  dismiss = (id?: ToastId): ToastId | undefined => {
    if (id !== undefined) {
      // A second dismissal of the same id, or one for an id that was never
      // created, is a no-op: lifecycle callbacks run exactly once.
      if (this.dismissedToasts.has(id)) return id
      const record = this.toasts.find((toast) => toast.id === id)
      if (!record) return id
      this.dismissRecord(record)
      this.pruneHistory()
    } else {
      resetEpoch += 1
      const errors: unknown[] = []
      for (const record of [...this.toasts]) {
        if (this.dismissedToasts.has(record.id)) continue
        try {
          this.dismissRecord(record)
        } catch (error) {
          errors.push(error)
        }
      }
      this.pruneHistory()
      if (errors.length) throw errors[0]
    }
    return id
  }

  /**
   * Publish one dismissal and then run its `onDismiss` callback once,
   * independently of how many toasters are mounted.
   */
  private dismissRecord = (record: ToastT): void => {
    this.dismissedToasts.add(record.id)
    try {
      this.publish({ id: record.id, dismiss: true })
    } finally {
      record.onDismiss?.(record)
    }
  }

  /**
   * Keep at most `HISTORY_LIMIT` dismissed records so long-lived pages do
   * not retain every toast (and its callbacks or custom elements) forever.
   */
  private pruneHistory = (): void => {
    let dismissed = 0
    for (const record of this.toasts) if (this.dismissedToasts.has(record.id)) dismissed += 1
    if (dismissed <= HISTORY_LIMIT) return
    let excess = dismissed - HISTORY_LIMIT
    const kept: ToastT[] = []
    // `toasts` is newest-first, so drop the oldest dismissed records.
    for (let index = this.toasts.length - 1; index >= 0; index -= 1) {
      const record = this.toasts[index]!
      if (excess > 0 && this.dismissedToasts.has(record.id)) {
        this.dismissedToasts.delete(record.id)
        excess -= 1
        continue
      }
      kept.push(record)
    }
    this.toasts = kept.reverse()
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

    const epoch = resetEpoch
    let ownedRecord: ToastT | undefined
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
      const created = this.createRecord(loadingPayload)
      id = created.id
      ownedRecord = created.record
    }

    const isCurrent = (): boolean =>
      resetEpoch === epoch &&
      (id === undefined ||
        (!this.dismissedToasts.has(id) &&
          this.toasts.find((record) => record.id === id) === ownedRecord))
    const resolved = resolveInput()

    const state: { result: ['resolve', ToastData] | ['reject', unknown] | null } = { result: null }

    const handleValue = async <K extends 'success' | 'error'>(
      value: PromiseValue<unknown> | undefined,
      type: K
    ): Promise<void> => {
      if (value === undefined || !isCurrent()) return
      const errorInfo = state.result?.[1]
      const resolvedValue =
        typeof value === 'function' ? await (value as (data: unknown) => unknown)(errorInfo) : value

      // `description` may be a function of the settled value: the resolved
      // data on success, or the rejection reason / failed Response on error.
      let resolvedDescription: Renderable | undefined
      if (typeof data.description === 'function') {
        resolvedDescription = await (
          data.description as (data: unknown) => Renderable | Promise<Renderable>
        )(errorInfo)
      } else if (data.description !== undefined) {
        resolvedDescription = data.description
      }

      if (!isCurrent()) return

      const {
        loading: _loading,
        success: _success,
        error: _error,
        finally: _finally,
        description: _description,
        ...settledOptions
      } = data
      void _loading
      void _success
      void _error
      void _finally
      void _description
      if (isExtendedResult(resolvedValue)) {
        const { message: extendedMessage, ...rest } = resolvedValue
        const payload: ToastInput = {
          ...settledOptions,
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
        ...settledOptions,
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
        // Omitted/failed formatters must not strand an immortal loading toast.
        try {
          if (id !== undefined && isCurrent() && ownedRecord?.type === 'loading') this.dismiss(id)
        } finally {
          await data.finally?.()
        }
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
    return this.create({ ...(data ?? {}), custom: content })
  }

  getActiveToasts = (): ToastT[] =>
    this.toasts.filter((toast) => !this.dismissedToasts.has(toast.id))

  getHistory = (): ToastT[] => this.toasts.map(cloneToast)

  getToasts = (): ToastT[] => this.getActiveToasts().map(cloneToast)
}

const cloneToast = (toast: ToastT): ToastT => ({
  ...toast,
  ...(toast.action ? { action: { ...toast.action } } : {}),
  ...(toast.cancel ? { cancel: { ...toast.cancel } } : {})
})

const isHttpResponse = (value: unknown): value is Response =>
  typeof value === 'object' &&
  value !== null &&
  'ok' in value &&
  typeof (value as { ok: unknown }).ok === 'boolean' &&
  'status' in value &&
  typeof (value as { status: unknown }).status === 'number'

const isExtendedResult = (value: unknown): value is { message: Renderable } & ToastOptions =>
  typeof value === 'object' &&
  value !== null &&
  'message' in value &&
  !Array.isArray(value) &&
  !(value instanceof Error)

export const ToastState = new Observer()

/**
 * Reset the singleton — used by tests and `resetToasts()` to ensure
 * each scenario starts from a clean counter and empty queues.
 */
export function resetToastState(): void {
  resetEpoch += 1
  ToastState.subscribers = []
  ToastState.toasts = []
  ToastState.dismissedToasts = new Set()
  toastsCounter = 1
}
