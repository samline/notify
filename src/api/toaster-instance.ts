// Internal toaster registry. Holds the singleton controller created
// by `createToaster()` so that `getToaster()` and `destroyToaster()`
// can read / clear it without re-creating the DOM.
//
// Kept as its own file (not in `core/`) because it depends on the
// api-side effect of mounting a controller; pure core stays DOM-free.

import type { ToasterController } from '../core/types'

let currentToaster: ToasterController | null = null

export const setToaster = (controller: ToasterController | null): void => {
  currentToaster = controller
}

export const getToasterInstance = (): ToasterController | null => currentToaster

export const clearToaster = (): void => {
  currentToaster = null
}
