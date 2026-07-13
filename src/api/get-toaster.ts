// `getToaster()` — return the singleton toaster controller, or `null`
// if none is mounted.

import { getToasterInstance } from './toaster-instance'
import type { ToasterController } from '../core/types'

export function getToaster(): ToasterController | null {
  return getToasterInstance()
}
