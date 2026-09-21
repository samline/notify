// Smoke tests for the `getToaster` API.

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { createToaster } from '../../src/api/create-toaster'
import { destroyToaster } from '../../src/api/destroy-toaster'
import { getToaster } from '../../src/api/get-toaster'
import { resetToasts } from '../../src/api/reset-toasts'
import { toast } from '../../src/api/toast'

describe('api/get-toaster', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    resetToasts()
  })

  afterEach(() => {
    destroyToaster()
    resetToasts()
  })

  it('returns null when no toaster has been mounted', () => {
    expect(getToaster()).toBeNull()
  })

  it('returns the same controller as createToaster()', () => {
    const a = createToaster({ position: 'top-left' })
    const b = getToaster()
    expect(a).toBe(b)
    expect(b?.element.getAttribute('data-y-position')).toBe('top')
  })

  it('keeps the mounted renderer subscribed after resetToasts()', () => {
    createToaster()
    toast('before reset')

    resetToasts()
    toast('after reset')

    expect(toast.getToasts()).toHaveLength(1)
    expect(document.body.querySelector('[data-title]')?.textContent).toBe('after reset')
  })

  it('clears the singleton when its controller is destroyed directly', () => {
    const first = createToaster()

    first.destroy()

    expect(getToaster()).toBeNull()
    expect(createToaster()).not.toBe(first)
  })
})
