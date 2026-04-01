import { beforeEach, describe, expect, it, vi } from 'vitest'

import { resetToastState, toast } from '../src/state'

describe('toast state', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0)
      return 0
    })
    resetToastState()
  })

  it('stores and dismisses toasts', () => {
    const toastId = toast('Hello world')

    expect(toast.getHistory()).toHaveLength(1)
    expect(toast.getToasts()).toHaveLength(1)
    expect(toast.getToasts()[0]?.id).toBe(toastId)

    toast.dismiss(toastId)

    expect(toast.getHistory()).toHaveLength(1)
    expect(toast.getToasts()).toHaveLength(0)
  })

  it('updates an existing toast by id', () => {
    const toastId = toast('Original message')
    toast('Updated message', { id: toastId })

    expect(toast.getToasts()).toHaveLength(1)
    expect(toast.getToasts()[0]).toMatchObject({ title: 'Updated message' })
  })
})
