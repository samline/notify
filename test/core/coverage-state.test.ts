import { afterEach, describe, expect, it, vi } from 'vitest'

import { ToastState, resetToastState } from '../../src/core/state'

const settle = () => new Promise(resolve => setTimeout(resolve, 0))

describe('state coverage', () => {
  afterEach(() => resetToastState())

  it('keeps publishing after a failing subscriber and rethrows the first error', () => {
    const late = vi.fn()
    const unsubscribeFirst = ToastState.subscribe(() => {
      unsubscribeLate()
      throw new Error('first')
    })
    const unsubscribeLate = ToastState.subscribe(late)
    expect(() => ToastState.create({ message: 'Hi', id: 'x' })).toThrow('first')
    expect(late).not.toHaveBeenCalled()
    unsubscribeFirst()
    unsubscribeFirst()
  })

  it('creates fresh ids for empty string ids and reuses dismissed ids', () => {
    const first = ToastState.create({ message: 'A', id: '' })
    expect(typeof first).toBe('number')
    ToastState.dismiss(first)
    expect(ToastState.create({ message: 'Again', id: first })).toBe(first)
    expect(ToastState.getActiveToasts().map(toast => toast.id)).toContain(first)
  })

  it('settles promises from factories, failed responses, errors and rich results', async () => {
    const thrown = ToastState.promise(
      () => {
        throw new Error('sync')
      },
      { loading: 'Wait', error: (reason: unknown) => (reason as Error).message }
    )
    await expect(thrown.unwrap()).rejects.toThrow('sync')

    const response = { ok: false, status: 500 } as Response
    const failed = ToastState.promise(Promise.resolve(response), {
      loading: 'Wait',
      error: 'Server error',
      description: () => 'Retry later',
    })
    await failed.unwrap()
    await settle()
    expect(ToastState.getHistory().find(toast => toast.id === failed.id)?.title).toBe(
      'Server error'
    )

    const resolvedError = ToastState.promise(Promise.resolve(new Error('soft')), {
      loading: 'Wait',
      error: { message: 'Rich error', description: 'From object' },
      description: 'Static',
    })
    await resolvedError.unwrap()
    await settle()
    expect(ToastState.getHistory().find(toast => toast.id === resolvedError.id)?.type).toBe('error')

    const finallyFn = vi.fn()
    const silent = ToastState.promise(Promise.resolve('ok'), {
      loading: 'Wait',
      finally: finallyFn,
    })
    await silent.unwrap()
    await settle()
    expect(finallyFn).toHaveBeenCalled()
    expect(ToastState.getActiveToasts().some(toast => toast.id === silent.id)).toBe(false)

    const passthrough = ToastState.promise(Promise.resolve(7))
    await expect(passthrough.unwrap()).resolves.toBe(7)
    const noLoading = ToastState.promise(Promise.resolve(1), { success: 'Done' })
    expect(noLoading.id).toBeUndefined()
    await noLoading.unwrap()

    // A reset while pending drops the stale result.
    const stale = ToastState.promise(new Promise(resolve => setTimeout(resolve, 5, 'late')), {
      loading: 'Wait',
      success: 'Never shown',
    })
    resetToastState()
    await stale.unwrap()
    await settle()
    expect(ToastState.getHistory()).toHaveLength(0)
  })
})
