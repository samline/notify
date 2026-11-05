import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { HISTORY_LIMIT, ToastState, resetToastState } from '../../src/core/state'
import { toast } from '../../src/api/toast'
import type { ToastT } from '../../src/core/types'

describe('core/state', () => {
  beforeEach(() => {
    resetToastState()
  })

  afterEach(() => {
    resetToastState()
  })

  describe('create', () => {
    it('adds a toast and returns an autoincrement id', () => {
      const first = ToastState.create({ message: 'one' })
      const second = ToastState.create({ message: 'two' })

      expect(typeof first).toBe('number')
      expect(typeof second).toBe('number')
      expect(second).toBeGreaterThan(first as number)

      const active = ToastState.getActiveToasts()
      expect(active).toHaveLength(2)
      // Newest toast is at the front (matches the legacy React/sonner
      // contract and the renderer's `data-front='true'` at index 0).
      expect(active[0]?.title).toBe('two')
      expect(active[1]?.title).toBe('one')
    })

    it('does not duplicate when an explicit id is reused — it updates the existing toast', () => {
      const first = ToastState.create({ message: 'one', id: 'fixed' })
      const second = ToastState.create({ message: 'one updated', id: 'fixed' })

      expect(first).toBe('fixed')
      expect(second).toBe('fixed')
      const active = ToastState.getActiveToasts()
      expect(active).toHaveLength(1)
      expect(active[0]?.title).toBe('one updated')
    })

    it('does not collide generated ids with explicit numeric ids', () => {
      ToastState.create({ message: 'explicit', id: 1 })
      const generated = ToastState.create({ message: 'generated' })

      expect(generated).toBe(2)
      expect(ToastState.getActiveToasts()).toHaveLength(2)
    })

    it('defaults `dismissible` to true', () => {
      ToastState.create({ message: 'open' })
      const [toast] = ToastState.getActiveToasts()
      expect(toast?.dismissible).toBe(true)
    })

    it('respects explicit `dismissible: false`', () => {
      ToastState.create({ message: 'sticky', dismissible: false })
      const [toast] = ToastState.getActiveToasts()
      expect(toast?.dismissible).toBe(false)
    })

    it('evaluates a description factory once and stores its result', () => {
      let calls = 0
      ToastState.create({
        message: 'title',
        description: () => {
          calls += 1
          return 'details'
        }
      })

      expect(calls).toBe(1)
      expect(ToastState.getActiveToasts()[0]?.description).toBe('details')
    })
  })

  describe('dismiss', () => {
    it('dismisses a single id and removes it from the active list', () => {
      const id = ToastState.create({ message: 'temp' })
      ToastState.dismiss(id)
      expect(ToastState.getActiveToasts()).toHaveLength(0)
    })

    it('keeps dismissed toasts in the history (getHistory)', () => {
      const id = ToastState.create({ message: 'temp' })
      ToastState.dismiss(id)
      expect(toast.getHistory()).toHaveLength(1)
      expect(toast.getToasts()).toHaveLength(0)
    })

    it('dismisses every active toast when called with no args', () => {
      ToastState.create({ message: 'a' })
      ToastState.create({ message: 'b' })
      ToastState.create({ message: 'c' })
      expect(ToastState.getActiveToasts()).toHaveLength(3)

      ToastState.dismiss()
      expect(ToastState.getActiveToasts()).toHaveLength(0)
      expect(toast.getHistory()).toHaveLength(3)
    })

    it('double-dismiss on the same id is a no-op (no duplicate publish)', () => {
      let publishCount = 0
      let dismissCalls = 0
      const id = ToastState.create({ message: 'once', onDismiss: () => (dismissCalls += 1) })
      const unsubscribe = ToastState.subscribe((event) => {
        if ('dismiss' in event && event.dismiss) publishCount += 1
      })
      ToastState.dismiss(id)
      ToastState.dismiss(id)
      expect(publishCount).toBe(1)
      expect(dismissCalls).toBe(1)
      unsubscribe()
    })

    it('ignores dismissals for ids that were never created', () => {
      let publishCount = 0
      const unsubscribe = ToastState.subscribe(() => (publishCount += 1))
      ToastState.dismiss('ghost')
      expect(publishCount).toBe(0)
      expect(ToastState.dismissedToasts.has('ghost')).toBe(false)
      unsubscribe()
    })

    it('runs onDismiss once even with no toaster mounted', () => {
      const onDismiss = vi.fn()
      const id = ToastState.create({ message: 'headless', onDismiss })
      ToastState.dismiss(id)
      expect(onDismiss).toHaveBeenCalledOnce()
    })

    it('caps dismissed history at HISTORY_LIMIT, dropping the oldest', () => {
      for (let index = 0; index < HISTORY_LIMIT + 10; index += 1) {
        ToastState.dismiss(ToastState.create({ message: `t${index}` }))
      }
      const live = ToastState.create({ message: 'live' })
      const history = ToastState.getHistory()
      expect(history).toHaveLength(HISTORY_LIMIT + 1)
      expect(history[0]?.id).toBe(live)
      expect(history[history.length - 1]?.title).toBe('t10')
      expect(ToastState.dismissedToasts.size).toBe(HISTORY_LIMIT)
    })

    it('notifies subscribers about a dismiss event', () => {
      const id = ToastState.create({ message: 'evented' })
      const events: Array<unknown> = []
      const unsubscribe = ToastState.subscribe((event) => events.push(event))

      ToastState.dismiss(id)
      expect(events).toHaveLength(1)
      expect(events[0]).toMatchObject({ id, dismiss: true })

      unsubscribe()
    })
  })

  describe('variants', () => {
    it('success sets type=success', () => {
      ToastState.success('Saved')
      const [toast] = ToastState.getActiveToasts()
      expect(toast?.type).toBe('success')
      expect(toast?.title).toBe('Saved')
    })

    it('info sets type=info', () => {
      ToastState.info('Heads up')
      const [toast] = ToastState.getActiveToasts()
      expect(toast?.type).toBe('info')
    })

    it('warning sets type=warning', () => {
      ToastState.warning('Careful')
      const [toast] = ToastState.getActiveToasts()
      expect(toast?.type).toBe('warning')
    })

    it('error sets type=error', () => {
      ToastState.error('Boom')
      const [toast] = ToastState.getActiveToasts()
      expect(toast?.type).toBe('error')
    })

    it('loading sets type=loading', () => {
      ToastState.loading('Loading...')
      const [toast] = ToastState.getActiveToasts()
      expect(toast?.type).toBe('loading')
    })

    it('message is an alias that sets a normal-type toast', () => {
      ToastState.message('Hi')
      const [toast] = ToastState.getActiveToasts()
      expect(toast?.type).toBeUndefined()
      expect(toast?.title).toBe('Hi')
    })
  })

  describe('promise', () => {
    it('emits loading + success on resolve', async () => {
      const events: ToastT[] = []
      const unsubscribe = ToastState.subscribe((event) => {
        if ('title' in event) events.push(event as ToastT)
      })

      const result = ToastState.promise(Promise.resolve({ name: 'Sam' }), {
        loading: 'Loading...',
        success: (data) => `Hi ${(data as { name: string }).name}`
      })
      expect(typeof result).toBe('object')
      expect(typeof (result as { unwrap: () => unknown }).unwrap).toBe('function')

      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()

      const types = events.map((event) => event.type)
      expect(types).toContain('loading')
      expect(types).toContain('success')
      const success = events.find((event) => event.type === 'success')
      expect(success?.title).toBe('Hi Sam')

      unsubscribe()
    })

    it('emits loading + error on reject', async () => {
      const events: ToastT[] = []
      const unsubscribe = ToastState.subscribe((event) => {
        if ('title' in event) events.push(event as ToastT)
      })

      ToastState.promise(Promise.reject(new Error('boom')), {
        loading: 'Loading...',
        error: 'Could not load'
      })

      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()

      const types = events.map((event) => event.type)
      expect(types).toContain('loading')
      expect(types).toContain('error')
      const errorEvent = events.find((event) => event.type === 'error')
      expect(errorEvent?.title).toBe('Could not load')

      unsubscribe()
    })

    it('does not emit loading when `data.loading` is undefined', async () => {
      const events: ToastT[] = []
      const unsubscribe = ToastState.subscribe((event) => {
        if ('title' in event) events.push(event as ToastT)
      })

      ToastState.promise(Promise.resolve(42), {
        success: 'Done'
      })
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()

      const types = events.map((event) => event.type)
      expect(types).not.toContain('loading')
      expect(types).toContain('success')

      unsubscribe()
    })

    it('attaches `promise` to the loading toast so the renderer can set data-promise', () => {
      const events: ToastT[] = []
      const unsubscribe = ToastState.subscribe((event) => {
        if ('title' in event) events.push(event as ToastT)
      })

      const p = Promise.resolve('ok')
      const result = ToastState.promise(p, {
        loading: 'Loading...',
        success: 'Done'
      })
      const id = (result as { id?: string | number }).id
      expect(id).toBeDefined()

      const loading = events.find((event) => event.id === id && event.type === 'loading')
      expect(loading).toBeDefined()
      // Fix 5: the legacy React build also attached the promise to
      // the toast. The vanilla refactor dropped it; we re-added it
      // so the renderer can set `data-promise='true'`.
      expect(loading?.promise).toBe(p)

      unsubscribe()
    })

    it('calls the function form of `description` on error (Fix 17)', async () => {
      const events: ToastT[] = []
      const unsubscribe = ToastState.subscribe((event) => {
        if ('title' in event) events.push(event as ToastT)
      })

      const result = ToastState.promise(Promise.reject(new Error('boom')), {
        loading: 'Loading...',
        error: 'Failed',
        // The user wants the description to be dynamic based on
        // the error. Before Fix 17 this was silently dropped.
        description: (err) => `Caught: ${(err as Error).message}`
      })
      const id = (result as { id?: string | number }).id
      expect(id).toBeDefined()

      // Flush microtasks so the rejection's catch handler runs.
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()

      const errored = events.find((event) => event.id === id && event.type === 'error')
      expect(errored).toBeDefined()
      expect(errored?.description).toBe('Caught: boom')

      unsubscribe()
    })

    it('unwrap preserves the original resolution when a renderer callback throws', async () => {
      const result = ToastState.promise(Promise.resolve('original'), {
        success: () => {
          throw new Error('formatter failed')
        }
      })

      await expect(result.unwrap()).resolves.toBe('original')
    })

    it('unwrap waits for an async finally callback', async () => {
      let finishFinally: (() => void) | undefined
      const finallyPending = new Promise<void>((resolve) => {
        finishFinally = resolve
      })
      let finished = false
      const result = ToastState.promise(Promise.resolve('ok'), {
        success: 'Done',
        finally: async () => {
          await finallyPending
          finished = true
        }
      })
      const unwrapped = result.unwrap()

      await Promise.resolve()
      expect(finished).toBe(false)
      finishFinally?.()
      await expect(unwrapped).resolves.toBe('ok')
      expect(finished).toBe(true)
    })

    it('turns a synchronously throwing promise thunk into an unwrap rejection', async () => {
      const error = new Error('sync failure')
      const result = ToastState.promise(
        () => {
          throw error
        },
        { error: 'Failed' }
      )

      await expect(result.unwrap()).rejects.toBe(error)
    })
  })

  describe('custom', () => {
    it('stores a custom payload (HTMLElement)', () => {
      const el = document.createElement('div')
      el.textContent = 'custom!'
      const id = ToastState.custom(el, { id: 'custom-1' })
      expect(id).toBe('custom-1')
      const [toast] = ToastState.getActiveToasts()
      expect(toast?.custom).toBe(el)
    })

    it('stores a custom payload (callback)', () => {
      const id = ToastState.custom((container) => {
        container.textContent = 'via callback'
      })
      expect(typeof id).toBe('number')
      const [toast] = ToastState.getActiveToasts()
      expect(typeof toast?.custom).toBe('function')
    })
  })

  describe('resetToastState', () => {
    it('clears toasts, subscribers, and rewinds the counter', () => {
      ToastState.create({ message: 'a' })
      const unsubscribe = ToastState.subscribe(() => {})
      ToastState.dismiss()

      resetToastState()

      expect(toast.getHistory()).toHaveLength(0)
      expect(ToastState.subscribers).toHaveLength(0)

      const after = ToastState.create({ message: 'b' })
      expect(after).toBe(1)

      unsubscribe()
    })
  })
})
