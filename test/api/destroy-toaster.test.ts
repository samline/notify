import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { createToaster } from '../../src/api/create-toaster'
import { destroyToaster } from '../../src/api/destroy-toaster'
import { getToaster } from '../../src/api/get-toaster'
import { resetToastState } from '../../src/core/state'
import { toast } from '../../src/api/toast'

describe('api/destroy-toaster', () => {
  beforeEach(() => {
    destroyToaster()
    resetToastState()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    destroyToaster()
    resetToastState()
    document.body.innerHTML = ''
  })

  it('is a no-op when no toaster is mounted', () => {
    expect(() => destroyToaster()).not.toThrow()
    expect(getToaster()).toBeNull()
  })

  it('unmounts the toaster and clears the singleton', () => {
    const controller = createToaster()
    expect(getToaster()).toBe(controller)
    expect(document.body.querySelector('ol[data-notify-toaster]')).toBeTruthy()

    destroyToaster()
    expect(getToaster()).toBeNull()
    expect(document.body.querySelector('ol[data-notify-toaster]')).toBeNull()
  })

  it('also dismisses every active toast', () => {
    createToaster()
    toast('one')
    toast('two')
    expect(toast.getToasts()).toHaveLength(2)

    destroyToaster()
    expect(toast.getToasts()).toHaveLength(0)
  })
})

describe('api/get-toaster', () => {
  beforeEach(() => {
    destroyToaster()
    resetToastState()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    destroyToaster()
    resetToastState()
    document.body.innerHTML = ''
  })

  it('returns null when no toaster is mounted', () => {
    expect(getToaster()).toBeNull()
  })

  it('returns the singleton controller once mounted', () => {
    const controller = createToaster({ position: 'top-right' })
    const result = getToaster()
    expect(result).toBe(controller)
    expect(result?.options.position).toBe('top-right')
  })
})
