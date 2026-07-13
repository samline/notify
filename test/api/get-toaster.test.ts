// Smoke tests for the `getToaster` API.

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { createToaster } from '../../src/api/create-toaster'
import { destroyToaster } from '../../src/api/destroy-toaster'
import { getToaster } from '../../src/api/get-toaster'
import { resetToasts } from '../../src/api/reset-toasts'

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
})
