import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { toast } from '../../src/api/toast'
import { resetToastState, ToastState } from '../../src/core/state'

describe('api/toast', () => {
  beforeEach(() => {
    resetToastState()
  })

  afterEach(() => {
    resetToastState()
  })

  it('toast(message) creates a normal toast and returns its id', () => {
    const id = toast('hello')
    expect(typeof id).toBe('number')
    const active = toast.getToasts()
    expect(active).toHaveLength(1)
    expect(active[0]?.title).toBe('hello')
  })

  it('toast(message, opts) stores description and type', () => {
    const id = toast('hello', { description: 'world', type: 'success' })
    const found = toast.getToasts().find((entry) => entry.id === id)
    expect(found?.description).toBe('world')
    expect(found?.type).toBe('success')
  })

  it('toast.success / error / info / warning / loading set the right type', () => {
    toast.success('s')
    toast.error('e')
    toast.info('i')
    toast.warning('w')
    toast.loading('l')

    const titles = toast.getToasts().map((entry) => entry.type)
    expect(titles).toEqual(
      expect.arrayContaining(['success', 'error', 'info', 'warning', 'loading'])
    )
  })

  it('toast.dismiss(id) removes a single toast', () => {
    const id = toast('one')
    toast.dismiss(id)
    expect(toast.getToasts()).toHaveLength(0)
    expect(toast.getHistory()).toHaveLength(1)
  })

  it('toast.dismiss() (no args) dismisses every active toast', () => {
    toast('a')
    toast('b')
    toast('c')
    toast.dismiss()
    expect(toast.getToasts()).toHaveLength(0)
    expect(toast.getHistory()).toHaveLength(3)
  })

  it('toast.promise returns an unwrap function and emits loading + success', async () => {
    const events: Array<{ type?: string }> = []
    const unsubscribe = ToastState.subscribe((event) => {
      if ('type' in event) events.push(event as { type?: string })
    })

    const result = toast.promise(Promise.resolve(42), {
      loading: 'Loading...',
      success: 'Done'
    })
    // The promise returns either `{ id, unwrap }` (when loading was emitted)
    // or `{ unwrap }` (when no loading). In both cases, `unwrap` must be present.
    expect(typeof result).toBe('object')
    expect(typeof (result as { unwrap: () => unknown }).unwrap).toBe('function')

    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    const types = events.map((event) => event.type)
    expect(types).toContain('loading')
    expect(types).toContain('success')

    unsubscribe()
  })

  it('toast.message is an alias for the base toast()', () => {
    const id = toast.message('explicit message')
    expect(toast.getToasts()[0]?.id).toBe(id)
  })

  it('toast.getHistory returns every toast, even dismissed ones', () => {
    const a = toast('a')
    toast('b')
    toast.dismiss(a)
    expect(toast.getHistory()).toHaveLength(2)
  })
})
