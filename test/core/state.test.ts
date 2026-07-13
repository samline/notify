import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { ToastState, resetToastState, toast } from '../../src/core/state'
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
      expect(active[0]?.title).toBe('one')
      expect(active[1]?.title).toBe('two')
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
