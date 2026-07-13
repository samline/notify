import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { createToaster } from '../../src/api/create-toaster'
import { configureToaster } from '../../src/api/configure-toaster'
import { destroyToaster } from '../../src/api/destroy-toaster'
import { getToaster } from '../../src/api/get-toaster'
import { resetToastState } from '../../src/core/state'

describe('api/create-toaster', () => {
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

  it('mounts an <ol data-notify-toaster> in the document body', () => {
    const controller = createToaster()
    const toaster = document.body.querySelector('ol[data-notify-toaster]')
    expect(toaster).toBeTruthy()
    expect(controller.element).toBe(toaster)
  })

  it('reuses the singleton — calling twice returns the same controller', () => {
    const a = createToaster({ duration: 1000 })
    const b = createToaster({ duration: 5000 })
    expect(b).toBe(a)
    // options should have been updated to the new duration
    expect(b.options.duration).toBe(5000)
  })

  it('configureToaster is an alias of createToaster', () => {
    const a = createToaster({ duration: 1000 })
    const b = configureToaster({ duration: 2500 })
    expect(b).toBe(a)
    expect(b.options.duration).toBe(2500)
  })

  it('throws when called outside a DOM environment', () => {
    const original = (globalThis as { document?: Document }).document
    const w = globalThis as { document?: Document; window?: unknown }
    delete w.document
    try {
      expect(() => createToaster()).toThrow(/DOM/)
    } finally {
      if (original) w.document = original
    }
  })
})
