// `createToaster(options?)` — mount (or update) a single toaster and
// return its controller. Idempotent: calling twice with different
// options applies the diff via `controller.update()`.

import { mountToaster } from '../core/renderer'
import { canUseDOM } from '../core/dom-helpers'
import { setToaster, getToasterInstance } from './toaster-instance'
import type { ToasterController, ToasterOptions } from '../core/types'

export function createToaster(options?: ToasterOptions): ToasterController {
  if (!canUseDOM()) {
    throw new Error('createToaster() requires a DOM environment (browser)')
  }
  const existing = getToasterInstance()
  if (existing) {
    return existing.update(options)
  }
  const root = document.body
  const controller = mountToaster(root, options ?? {})
  setToaster(controller)
  return controller
}
