// `configureToaster(options?)` — alias of `createToaster()`. Kept as a
// separate export so consumers can express intent ("I want to tweak
// the existing toaster" vs "I want a fresh toaster") in their code
// without losing the idempotency.

import { createToaster } from './create-toaster'
import type { ToasterController, ToasterOptions } from '../core/types'

export function configureToaster(options?: ToasterOptions): ToasterController {
  return createToaster(options)
}
